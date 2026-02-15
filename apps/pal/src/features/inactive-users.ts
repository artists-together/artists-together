import { lt } from "drizzle-orm"
import { client, getGuild } from "../lib/client.ts"
import { ROLE } from "../lib/constants.ts"
import { connectDatabase } from "../lib/db/driver.ts"
import { inactiveUserActivity } from "../lib/db/schema.ts"

const INACTIVE_THRESHOLD_MONTHS = 4

const INACTIVE_SCAN_INTERVAL_MS = 1000 * 60 * 60 * 12

const PRESENCE_SCAN_INTERVAL_MS = 1000 * 60 * 60 * 12

const ONE_HOUR_MS = 3_600_000

function getInactiveCutoffMs() {
  const cutoff = new Date()
  // TODO: remove this line after testing
  cutoff.setMilliseconds(cutoff.getMilliseconds() - ONE_HOUR_MS)

  // cutoff.setMonth(cutoff.getMonth() - INACTIVE_THRESHOLD_MONTHS)
  return cutoff.getTime()
}

function upsertLastOnline(userId: string, nowMs: number) {
  return connectDatabase()
    .insert(inactiveUserActivity)
    .values({ userId, lastOnlineAt: nowMs })
    .onConflictDoUpdate({
      target: inactiveUserActivity.userId,
      set: { lastOnlineAt: nowMs },
    })
    .run()
}

async function seedOnlineUsers() {
  const guild = await getGuild()
  const nowMs = Date.now()

  try {
    const members = await guild.members.fetch({
      withPresences: true,
    })

    let updated = 0
    for (const member of members.values()) {
      if (member.user.bot) continue
      if (!member.presence) continue
      if (member.presence.status === "offline") continue
      upsertLastOnline(member.user.id, nowMs)
      updated += 1
    }

    console.log(`[inactive-users] seed online ${updated}`)
  } catch (error) {
    console.error("[inactive-users] seed online failed", error)
  }
}

let isInactiveScanRunning = false

async function scanInactiveUsers() {
  if (isInactiveScanRunning) return

  isInactiveScanRunning = true

  try {
    const guild = await getGuild()
    const database = connectDatabase()
    const cutoffMs = getInactiveCutoffMs()

    const inactiveUsers = await database
      .select({ userId: inactiveUserActivity.userId })
      .from(inactiveUserActivity)
      .where(lt(inactiveUserActivity.lastOnlineAt, cutoffMs))
      .all()

    console.log(
      `[inactive-users] scanning ${inactiveUsers.length} user${inactiveUsers.length === 1 ? "" : "s"}`,
    )

    for (const inactiveUser of inactiveUsers) {
      try {
        const member = await guild.members.fetch(inactiveUser.userId)
        if (member.user.bot) continue
        if (member.roles.cache.has(ROLE.INACTIVE)) continue
        console.log("[inactive-users] add inactive", member.user.username)
        await member.roles.add(
          ROLE.INACTIVE,
          `Offline > ${INACTIVE_THRESHOLD_MONTHS} months`,
        )
      } catch (error) {
        console.error("[inactive-users] add inactive failed", error)
        continue
      }
    }
  } finally {
    isInactiveScanRunning = false
  }
}

/**
 * Tracks offline users and assigns inactive role
 * after a threshold.
 */
client.on("presenceUpdate", async (_, presenceNew) => {
  if (!presenceNew.user) return
  if (!presenceNew.member) return
  if (presenceNew.user.bot) return
  if (presenceNew.status === "offline") return

  const nowMs = Date.now()
  upsertLastOnline(presenceNew.user.id, nowMs)

  if (presenceNew.member.roles.cache.has(ROLE.INACTIVE)) {
    console.log("[inactive-users] remove inactive", presenceNew.user.username)
    await presenceNew.member.roles.remove(ROLE.INACTIVE, "Back online")
  }
})

client.on("clientReady", () => {
  seedOnlineUsers()
  scanInactiveUsers()
  setInterval(() => {
    seedOnlineUsers()
  }, PRESENCE_SCAN_INTERVAL_MS)
  setInterval(() => {
    scanInactiveUsers()
  }, INACTIVE_SCAN_INTERVAL_MS)
})

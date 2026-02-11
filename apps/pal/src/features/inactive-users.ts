import { lt } from "drizzle-orm"
import { client, getGuild } from "../lib/client.ts"
import { ROLE } from "../lib/constants.ts"
import { connectDatabase } from "../lib/db/driver.ts"
import { inactiveUserActivity } from "../lib/db/schema.ts"

const INACTIVE_THRESHOLD_MONTHS = 4

const INACTIVE_SCAN_INTERVAL_MS = 1000 * 60 * 60 * 12

function getInactiveCutoffMs(nowMs: number) {
  const cutoff = new Date(nowMs)
  cutoff.setMonth(cutoff.getMonth() - INACTIVE_THRESHOLD_MONTHS)
  return cutoff.getTime()
}

let isInactiveScanRunning = false

async function scanInactiveUsers() {
  if (isInactiveScanRunning) return

  isInactiveScanRunning = true

  try {
    const guild = await getGuild()
    const database = connectDatabase()
    const cutoffMs = getInactiveCutoffMs(Date.now())

    const inactiveUsers = database
      .select({ userId: inactiveUserActivity.userId })
      .from(inactiveUserActivity)
      .where(lt(inactiveUserActivity.lastOnlineAt, cutoffMs))
      .all()

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

  const now = Date.now()
  const database = connectDatabase()

  database
    .insert(inactiveUserActivity)
    .values({
      userId: presenceNew.user.id,
      lastOnlineAt: now,
    })
    .onConflictDoUpdate({
      target: inactiveUserActivity.userId,
      set: {
        lastOnlineAt: now,
      },
    })
    .run()

  if (presenceNew.member.roles.cache.has(ROLE.INACTIVE)) {
    console.log("[inactive-users] remove inactive", presenceNew.user.username)
    await presenceNew.member.roles.remove(ROLE.INACTIVE, "Back online")
  }
})

client.on("clientReady", () => {
  void scanInactiveUsers()
  setInterval(() => {
    void scanInactiveUsers()
  }, INACTIVE_SCAN_INTERVAL_MS)
})

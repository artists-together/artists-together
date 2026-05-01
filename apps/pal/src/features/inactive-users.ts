import { lt, sql } from "drizzle-orm"
import { client, getGuild } from "../lib/client.ts"
import { ROLE } from "../lib/constants.ts"
import { database } from "../lib/db/driver.ts"
import { inactiveUserActivity } from "../lib/db/schema.ts"

const INACTIVE_THRESHOLD_MONTHS = 4

const INACTIVE_SCAN_INTERVAL_MS = 1000 * 60 * 60 * 12

const PRESENCE_SCAN_INTERVAL_MS = 1000 * 60 * 60 * 12

const PRESENCE_FLUSH_INTERVAL_MS = 1000 * 5

const PRESENCE_FLUSH_CHUNK_SIZE = 100

const PRESENCE_FLUSH_RETRY_MS = 1000 * 30

const pendingLastOnlineByUser = new Map<string, number>()

let isPresenceFlushRunning = false

let presenceFlushRetryAtMs = 0

function getInactiveCutoffMs() {
  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - INACTIVE_THRESHOLD_MONTHS)
  return cutoff.getTime()
}

function queueLastOnline(userId: string, nowMs: number) {
  pendingLastOnlineByUser.set(userId, nowMs)
}

function takePendingLastOnlineChunk() {
  return Array.from(pendingLastOnlineByUser.entries()).slice(
    0,
    PRESENCE_FLUSH_CHUNK_SIZE,
  )
}

function getErrorCause(error: unknown) {
  if (error instanceof Error) return error.cause
  return undefined
}

function getErrorStatus(error: unknown) {
  const cause = getErrorCause(error)
  if (cause instanceof Error) {
    const status = Reflect.get(cause, "status")
    if (typeof status === "number") return status
  }

  return undefined
}

function getErrorCode(error: unknown) {
  if (!(error instanceof Error)) return undefined

  const code = Reflect.get(error, "code")
  if (typeof code === "string") return code

  return undefined
}

function isRateLimitError(error: unknown) {
  return getErrorStatus(error) === 429
}

function shouldReconnectDatabase(error: unknown) {
  if (!(error instanceof Error)) return false

  const message = error.message.toLowerCase()
  if (message.includes("client is closed")) return true
  if (message.includes("connection")) return true

  const cause = getErrorCause(error)
  if (!(cause instanceof Error)) return false

  const causeMessage = cause.message.toLowerCase()
  return causeMessage.includes("client is closed")
}

async function flushPendingLastOnline() {
  if (isPresenceFlushRunning) return
  if (pendingLastOnlineByUser.size === 0) return
  if (Date.now() < presenceFlushRetryAtMs) return

  isPresenceFlushRunning = true

  try {
    const chunk = takePendingLastOnlineChunk()
    if (chunk.length === 0) return

    await database
      .insert(inactiveUserActivity)
      .values(
        chunk.map(([userId, lastOnlineAt]) => ({
          userId,
          lastOnlineAt,
        })),
      )
      .onConflictDoUpdate({
        target: inactiveUserActivity.userId,
        set: {
          lastOnlineAt: sql`excluded.last_online_at`,
        },
      })
      .run()

    presenceFlushRetryAtMs = 0

    for (const [userId, lastOnlineAt] of chunk) {
      if (pendingLastOnlineByUser.get(userId) !== lastOnlineAt) continue
      pendingLastOnlineByUser.delete(userId)
    }

    console.log(
      `[inactive-users] flushed ${chunk.length} last-online update${chunk.length === 1 ? "" : "s"}`,
    )
  } catch (error) {
    const status = getErrorStatus(error)
    const code = getErrorCode(error)

    console.error("[inactive-users] flush failed", {
      code,
      pending: pendingLastOnlineByUser.size,
      status,
    })

    if (isRateLimitError(error)) {
      presenceFlushRetryAtMs = Date.now() + PRESENCE_FLUSH_RETRY_MS
      return
    }

    if (shouldReconnectDatabase(error)) {
      try {
        database.$client.reconnect()
      } catch (reconnectError) {
        console.error("[inactive-users] reconnect failed", reconnectError)
      }
    }
  } finally {
    isPresenceFlushRunning = false
  }
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
      queueLastOnline(member.user.id, nowMs)
      updated += 1
    }

    await flushPendingLastOnline()

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
  queueLastOnline(presenceNew.user.id, nowMs)

  if (presenceNew.member.roles.cache.has(ROLE.INACTIVE)) {
    try {
      console.log("[inactive-users] remove inactive", presenceNew.user.username)
      await presenceNew.member.roles.remove(ROLE.INACTIVE, "Back online")
    } catch (error) {
      console.error("[inactive-users] remove inactive failed", error)
    }
  }
})

client.on("clientReady", () => {
  seedOnlineUsers()
  scanInactiveUsers()
  setInterval(() => {
    flushPendingLastOnline()
  }, PRESENCE_FLUSH_INTERVAL_MS)
  setInterval(() => {
    seedOnlineUsers()
  }, PRESENCE_SCAN_INTERVAL_MS)
  setInterval(() => {
    scanInactiveUsers()
  }, INACTIVE_SCAN_INTERVAL_MS)
})

import { messages, CursorPosition, Room } from "@artists-together/core/ws"
import { createHash } from "crypto"
import { WebSocketServer, WebSocket } from "ws"

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080
const ALLOWED_ORIGINS = new Set(["https://www.artiststogether.online"])
const MAX_PAYLOAD_KB = 1024
const MAX_CONNECTIONS = 25
const MAX_CONNECTIONS_PER_IP = 5
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_MESSAGES = 200

function hashIp(ip: string) {
  return createHash("sha256").update(ip).digest("hex").substring(0, 16)
}

function checkRateLimit(clientId: string) {
  const now = Date.now()
  const timestamps = messageTimestamps.get(clientId) || []
  const filtered = timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS)

  if (filtered.length >= RATE_LIMIT_MAX_MESSAGES) {
    return false
  }

  filtered.push(now)
  messageTimestamps.set(clientId, filtered)
  return true
}

declare class StatefulWebSocket extends WebSocket {
  id: string
  ip: string
  position: CursorPosition
}

const textDecoder = new TextDecoder("UTF-8")
const connectionsPerIp = new Map<string, number>()
const messageTimestamps = new Map<string, number[]>()

const wss = new WebSocketServer<typeof StatefulWebSocket>({
  port: PORT,
  maxPayload: MAX_PAYLOAD_KB,
  verifyClient(info, done) {
    const url = new URL(info.origin)

    if (
      !ALLOWED_ORIGINS.has(url.origin) &&
      process.env.NODE_ENV !== "development"
    ) {
      console.warn("[verify] rejected origin", info.origin ?? "none")
      return done(false, 403, "Forbidden")
    }

    const ip = info.req.socket.remoteAddress

    if (!ip) {
      console.warn("[verify] rejected missing ip")
      return done(false, 400, "Bad Request")
    }

    if (wss.clients.size >= MAX_CONNECTIONS) {
      console.warn("[verify] rejected max connections", hashIp(ip))
      return done(false, 503, "Server busy")
    }

    const count = connectionsPerIp.get(ip) ?? 0
    if (count >= MAX_CONNECTIONS_PER_IP) {
      console.warn("[verify] rejected per-ip limit", hashIp(ip))
      return done(false, 429, "Too many connections")
    }

    connectionsPerIp.set(ip, count + 1)
    return done(true)
  },
})

wss.on("listening", () => {
  console.log(`[server] listening on port ${PORT}`)
})

wss.on("error", (error) => {
  console.error(`[server]`, error)
})

wss.on("connection", (ws, request) => {
  const ip = request.socket.remoteAddress

  if (!ip) {
    console.warn("[connection] dropping missing ip")
    return ws.close()
  }

  ws.ip = ip
  ws.id = crypto.randomUUID()
  ws.position = null

  console.log(
    "[connection] new connection",
    wss.clients.size,
    ws.id,
    hashIp(ws.ip),
  )

  const room: Room = {}
  for (const client of wss.clients) {
    if (client.id === ws.id) continue
    room[client.id] = client.position
  }

  ws.send(messages.server.handshake.serialize(["handshake", room]))

  ws.on("error", (error) => {
    console.error(
      "[connection] received error message from client with id",
      ws.id,
      error,
    )
  })

  ws.on("close", () => {
    if (!ws.ip) return
    console.log("[connection] disconnection", ws.id, hashIp(ws.ip))

    const count = connectionsPerIp.get(ws.ip) ?? 0
    if (count <= 1) {
      connectionsPerIp.delete(ws.ip)
    } else {
      connectionsPerIp.set(ws.ip, count - 1)
    }

    messageTimestamps.delete(ws.id)

    const message = messages.server.disconnect.serialize(["disconnect", ws.id])
    for (const client of wss.clients) {
      if (client === ws) continue
      if (client.readyState !== WebSocket.OPEN) continue
      client.send(message)
    }
  })

  ws.on("message", (raw, binary) => {
    if (binary) {
      console.warn("[connection] unsupported binary message")
      return ws.close()
    }

    if (!checkRateLimit(ws.id)) {
      console.warn("[connection] rate limit exceeded", ws.id)
      return ws.close(1008, "Rate limit exceeded")
    }

    const string = raw instanceof Buffer ? textDecoder.decode(raw) : raw
    const parsed = messages.client.update.deserialize(string)

    if (!parsed.success) {
      console.warn("[connection] invalid message", ws.id, parsed.issues)
      return ws.close()
    }

    const [type, payload] = parsed.output

    if (type !== "update") {
      console.warn("[connection] unsupported message", type)
      return ws.close()
    }

    const last = payload.at(-1)

    if (last) {
      ws.position = last[1]
    } else {
      console.warn("[connection] unable to find last position", ws.id, payload)
    }

    const message = messages.server.update.serialize([
      "update",
      [ws.id, payload],
    ])

    for (const client of wss.clients) {
      if (client === ws) continue
      if (client.readyState !== WebSocket.OPEN) continue
      client.send(message)
    }
  })
})

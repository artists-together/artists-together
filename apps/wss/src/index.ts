import { WebSocketServer, WebSocket } from "ws"
import { messages, CursorPosition, Room } from "@artists-together/core/ws"

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080

declare class StatefulWebSocket extends WebSocket {
  id: string
  position: CursorPosition
}

const textDecoder = new TextDecoder("UTF-8")

const wss = new WebSocketServer<typeof StatefulWebSocket>({
  port: PORT,
})

wss.on("listening", () => {
  console.log(`[server] listening on port ${PORT}`)
})

wss.on("error", (error) => {
  console.error(`[server]`, error)
})

wss.on("connection", (ws) => {
  ws.id = crypto.randomUUID()
  ws.position = null
  console.log("[connection] connection", ws.id)

  const room: Room = {}
  for (const client of wss.clients) {
    client.id
    client.position
    room[client.id] = client.position
  }

  ws.send(messages.server.connect.serialize(["connect", room]))

  ws.on("error", (error) => {
    console.error(
      "[connection] received error message from client with id",
      ws.id,
      error,
    )
  })

  ws.on("close", () => {
    console.log("[connection] disconnection", ws.id)
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

    const string = raw instanceof Buffer ? textDecoder.decode(raw) : raw
    const parsed = messages.client.update.deserialize(string)

    if (!parsed.success) {
      console.warn("[connection] invalid message", ws.id, parsed.issues)
      return ws.close()
    }

    console.dir(parsed.output, { depth: null })

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

    const message = messages.client.update.serialize(["update", payload])
    for (const client of wss.clients) {
      if (client === ws) continue
      if (client.readyState !== WebSocket.OPEN) continue
      client.send(message)
    }
  })
})

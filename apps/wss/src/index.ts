import { WebSocketServer, WebSocket } from "ws"
import { NullablePosition, send } from "@artists-together/core/ws"
import type { Room } from "../../../packages/core/src/ws"

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8080

declare class StatefulWebSocket extends WebSocket {
  id: string
  position: NullablePosition
}

const wss = new WebSocketServer<typeof StatefulWebSocket>({
  port: PORT,
})

function getRoom(): Room {
  return Array.from(wss.clients.values()).map((client) => [client.id, client.position])
}

wss.on("listening", function listening() {
  console.log(`Listening on port ${PORT}`)
})

wss.on("connection", function connection(ws) {
  ws.id = crypto.randomUUID()
  ws.position = null
  console.log("[connection] client connected with id", ws.id)

  ws.send(JSON.stringify([""]))

  ws.on("error", (error) => {
    console.error(
      "[connection] reveiced error message from client with id",
      ws.id,
      error,
    )
  })

  ws.on("message", function message(data, binary) {
    if (binary) return

    const

    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data, { binary: binary })
      }
    })
  })
})

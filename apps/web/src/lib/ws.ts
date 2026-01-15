"use client"

import { Messages, messages } from "@artists-together/core/ws"
import ReconnectingWebSocket from "reconnecting-websocket"

export const webSocket = new ReconnectingWebSocket(
  process.env.NODE_ENV === "development" ? "ws://localhost:8080" : "",
  [],
  {
    connectionTimeout: 1000,
    maxRetries: 10,
  },
)

export function onMessage<T extends keyof Messages["server"]>(
  key: T,
  callback: (message: Messages["server"][T]["~output"][1]) => void,
) {
  function handler(event: MessageEvent<unknown>) {
    if (typeof event.data !== "string") return
    const parsed = messages.server[key].deserialize(event.data)
    if (!parsed.success) return
    console.log("🌐 Received message", parsed.output)
    callback(parsed.output[1])
  }

  webSocket.addEventListener("message", handler)
  return () => webSocket.removeEventListener("message", handler)
}

export function sendMessage<T extends keyof Messages["client"]>(
  key: T,
  data: Messages["client"][T]["~input"],
) {
  const payload = messages.client[key].serialize(data)
  webSocket.send(payload)
}

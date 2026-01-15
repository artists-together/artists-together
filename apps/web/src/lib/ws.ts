"use client"

import { Messages, messages } from "@artists-together/core/ws"
import ReconnectingWebSocket from "reconnecting-websocket"

export const webSocket =
  typeof document === "undefined"
    ? undefined
    : new ReconnectingWebSocket(
        process.env.NODE_ENV === "development"
          ? "ws://localhost:8080"
          : "ws://localhost:8080",
        [],
        {
          connectionTimeout: 1000,
          maxRetries: 10,
        },
      )

console.log("Running!", typeof document === "undefined")

export function onMessage<T extends keyof Messages["server"]>(
  key: T,
  callback: (message: Messages["server"][T]["~output"][1]) => void,
) {
  if (!webSocket) {
    throw Error("WebSocket is unavailable during SSR.")
  }

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
  if (!webSocket) {
    throw Error("WebSocket is unavailable during SSR.")
  }

  const payload = messages.client[key].serialize(data)
  webSocket.send(payload)
}

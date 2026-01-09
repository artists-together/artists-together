"use client"

import { createParser } from "@artists-together/core/ws"
import { useSelectedLayoutSegments } from "next/navigation"
import { createContext, useEffect, useEffectEvent } from "react"

export const webSocket = new globalThis.WebSocket("")

const parser = createParser("")

export function WebSocket() {
  const segments = useSelectedLayoutSegments()
  const room = segments.join(":")

  useEffect(() => {
    const abortController = new AbortController()

    function onOpen() {}

    function onMessage(message: MessageEvent) {
      if (typeof message.data !== "string") return
    }

    webSocket.addEventListener("open", onOpen, {
      signal: abortController.signal,
    })

    webSocket.addEventListener("message", onMessage, {
      signal: abortController.signal,
    })

    return () => {
      abortController.abort()
    }
  }, [])
}

"use client"

import {
  CursorPositions,
  CursorPositionWithDelta,
  messages,
} from "@artists-together/core/ws"
import { Throttler } from "@tanstack/react-pacer"
import {
  AnimatePresence,
  clamp,
  motion,
  resize,
  Transition,
  useReducedMotion,
  useSpring,
} from "motion/react"
import { computed } from "nanostores"
import { useEffect, useState } from "react"
import Icon from "@/components/icon"
import { atomDocumentSize, atomRoom, getDocumentSize } from "@/lib/cursors"
import {
  createCriticallyDampedSpring,
  cursorPresenceVariants,
} from "@/lib/motion"
import { useStore } from "@/lib/nanostores"
import { useScreen } from "@/lib/tailwind"
import { webSocket } from "@/lib/ws"

const springMove: Transition = {
  type: "spring",
  damping: 2,
  mass: 0.01,
  stiffness: 100,
}

const springClick = createCriticallyDampedSpring({
  mass: 0.5,
  stiffness: 200,
})

const clampCursorPosition = clamp.bind(null, 0, 1)

const atomAlone = computed(atomRoom, (room) => {
  let alone = true
  for (const k in room) {
    if (k) {
      alone = false
      break
    }
  }
  return alone
})

export default function Cursor() {
  const [state, setState] = useState<"hide" | "show">("hide")
  const reducedMotion = useReducedMotion()
  const cursor = useScreen("cursor")
  const alone = useStore(atomAlone)
  const scale = useSpring(1, springClick)
  const x = useSpring(0, springMove)
  const y = useSpring(0, springMove)

  const isEligibleForCursor = cursor && !reducedMotion

  if (!isEligibleForCursor && state === "show") {
    setState("hide")
  }

  useEffect(() => {
    return resize(document.documentElement, (_, rect) => {
      atomDocumentSize.set(rect)
    })
  }, [])

  useEffect(() => {
    if (process.env.NODE_ENV === "development") return
    if (isEligibleForCursor) {
      document.documentElement.classList.add("cursor")
    } else {
      document.documentElement.classList.remove("cursor")
    }
  }, [isEligibleForCursor])

  useEffect(() => {
    if (!isEligibleForCursor) return

    const abortController = new AbortController()

    let timestamp = 0
    let positions: CursorPositions = []

    const notify = new Throttler(
      () => {
        if (!positions.length) return
        if (!webSocket) {
          throw Error("WebSocket is unavailable during SSR.")
        }
        webSocket.send(messages.client.update.serialize(["update", positions]))
        positions = []
      },
      {
        leading: false,
        wait: alone ? 5_000 : 1_000,
      },
    )

    const update = new Throttler(
      (event: MouseEvent) => {
        const now = performance.now()
        const delta = typeof timestamp === "number" ? now - timestamp : 0
        timestamp = now

        if (state === "hide") {
          if (alone) positions = [[delta, null]]
          return notify.maybeExecute()
        }

        const rect = getDocumentSize()
        const x = clampCursorPosition(event.pageX / rect.width)
        const y = clampCursorPosition(event.pageY / rect.height)
        const position: CursorPositionWithDelta = [delta, [x, y]]

        if (alone) {
          positions = [position]
        } else {
          positions.push(position)
        }

        return notify.maybeExecute()
      },
      {
        trailing: false,
        wait: alone ? 5_000 : 60,
      },
    )

    document.documentElement.addEventListener(
      "mouseenter",
      (event) => {
        x.jump(event.clientX)
        y.jump(event.clientY)
        update.maybeExecute(event)
        update.flush()
        setState("show")
      },
      { signal: abortController.signal },
    )

    document.documentElement.addEventListener(
      "mouseleave",
      (event) => {
        x.set(event.clientX)
        y.set(event.clientY)
        update.maybeExecute(event)
        update.flush()
        setState("hide")
      },
      { signal: abortController.signal },
    )

    window.addEventListener(
      "mousemove",
      (event) => {
        if (state === "hide") {
          x.jump(event.clientX)
          y.jump(event.clientY)
          update.maybeExecute(event)
          return setState("show")
        }

        x.set(event.clientX)
        y.set(event.clientY)
        update.maybeExecute(event)
      },
      { signal: abortController.signal },
    )

    window.addEventListener(
      "mousedown",
      (event) => {
        scale.set(0.9)
        update.maybeExecute(event)
        update.flush()
      },
      { signal: abortController.signal },
    )

    window.addEventListener(
      "mouseup",
      (event) => {
        scale.set(1)
        update.maybeExecute(event)
        update.flush()
      },
      { signal: abortController.signal },
    )

    return () => {
      abortController.abort()
    }
  }, [cursor, isEligibleForCursor, reducedMotion, state, scale, x, y, alone])

  return (
    <AnimatePresence initial={false}>
      {state === "show" ? (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed left-0 top-0 z-50 origin-top-left select-none"
          initial="hide"
          animate="show"
          exit="hide"
          variants={cursorPresenceVariants}
          style={{ x, y }}
        >
          <motion.div className="origin-top-left" style={{ scale }}>
            <Icon
              src="cursor"
              alt=""
              width={23}
              height={31}
              className="w-6 drop-shadow-cursor"
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

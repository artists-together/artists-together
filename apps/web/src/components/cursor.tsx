"use client"

import type {
  NullablePositionWithDelta,
  Position,
} from "@artists-together/core/ws"
import { Throttler } from "@tanstack/react-pacer"
import {
  AnimatePresence,
  clamp,
  motion,
  Transition,
  useReducedMotion,
  useSpring,
} from "motion/react"
import { useEffect, useState } from "react"
import Icon from "@/components/icon"
import { createCriticallyDampedSpring } from "@/lib/motion"
import { useScreen } from "@/lib/tailwind"
import { ins } from "motion/react-m"
import { DATA_ATTR_SCOPE, measure, ROOT_SCOPE } from "@/lib/cursors"

const springAppear: Transition = {
  type: "spring",
  damping: 2,
  mass: 0.075,
  stiffness: 100,
}

const springMove: Transition = {
  type: "spring",
  damping: 2,
  mass: 0.01,
  stiffness: 100,
}

const springScale = createCriticallyDampedSpring({
  mass: 0.5,
  stiffness: 200,
})

const clampCursorPosition = clamp.bind(null, 0, 1)

export default function Cursor() {
  const [state, setState] = useState<"hide" | "show">("hide")
  const reducedMotion = useReducedMotion()
  const cursor = useScreen("cursor")
  const scale = useSpring(1, springScale)
  const x = useSpring(0, springMove)
  const y = useSpring(0, springMove)

  const isEligibleForCursor = cursor && !reducedMotion

  if (!isEligibleForCursor && state) {
    setState("hide")
  }

  useEffect(() => {
    if (!isEligibleForCursor) return

    const abortController = new AbortController()

    const alone = true
    let timestamp: number | undefined = undefined
    let positions: NullablePositionWithDelta[] = []

    const notify = new Throttler(
      () => {
        console.log("TODO: 🔔 send websocket message with positions", positions)
        positions = []
      },
      {
        trailing: true,
        wait: alone ? 5_000 : 500,
      },
    )

    const update = new Throttler(
      (event: MouseEvent) => {
        console.log("Updating position...")
        const now = Date.now()
        const delta = typeof timestamp === "number" ? now - timestamp : 0
        timestamp = now

        if (state === "hide") {
          if (alone) positions = [[delta, null]]
          return notify.maybeExecute()
        }

        const closestScope =
          (event.target instanceof Element &&
            event.target.closest(`[${DATA_ATTR_SCOPE}]`)) ||
          document.documentElement

        const scope = closestScope.getAttribute(DATA_ATTR_SCOPE) || ROOT_SCOPE
        const rect = measure(scope, closestScope)
        const x = clampCursorPosition((event.clientX - rect.x) / rect.width)
        const y = clampCursorPosition((event.clientY - rect.y) / rect.height)
        const position: NullablePositionWithDelta = [delta, [scope, x, y]]

        if (alone) {
          positions = [position]
        } else {
          positions.push(position)
        }

        return notify.maybeExecute()
      },
      {
        trailing: true,
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
        if (!state) {
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
  }, [cursor, isEligibleForCursor, reducedMotion, state, scale, x, y])

  return (
    <AnimatePresence initial={false}>
      {state === "show" ? (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed left-0 top-0 isolate z-50 origin-top-left select-none"
          initial={{ scale: 0, transition: springAppear }}
          animate={{ scale: 1, transition: springAppear }}
          exit={{ scale: 0, transition: springAppear }}
          style={{ x, y, scale }}
        >
          <Icon src="cursor" alt="" className="drop-shadow-cursor" />
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

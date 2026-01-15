"use client"

import { CursorPositions } from "@artists-together/core/ws"
import { motion, resize, useMotionTemplate, useSpring } from "motion/react"
import { AnimatePresence, useScroll } from "motion/react"
import { computed } from "nanostores"
import { useEffect, useState } from "react"
import Icon from "@/components/icon"
import {
  atomRoom,
  measurements,
  measureScope,
  PerfectCursor,
} from "@/lib/cursors"
import { useStore } from "@/lib/nanostores"
import { onMessage } from "@/lib/ws"

function Cursor({ color, id }: { color: string; id: string }) {
  const [state, setState] = useState<"hide" | "show">("hide")
  const x = useSpring(0)
  const y = useSpring(0)
  const transform = useMotionTemplate`translateX(${x}%) translateY(${y}%)`

  const [pc] = useState(
    () =>
      new PerfectCursor((point) => {
        console.log("> perfect cursor point", point)
        x.set(point[0])
        y.set(point[1])
      }),
  )

  // Dispose the internal PerfectCursor timeout
  useEffect(() => {
    return () => {
      pc.dispose()
    }
  }, [pc])

  // Reset PerfectCursor state when hidden
  useEffect(() => {
    if (state === "hide") {
      pc.dispose()
      pc.reset()
    }
  }, [pc, state])

  useEffect(() => {
    let timeout: NodeJS.Timeout
    const queue: CursorPositions = []

    function update() {
      const current = queue.shift()

      if (!current) {
        console.log("no more entries on queue")
        return
      }

      console.log("🚀 processing position", current)
      const [delta, position] = current

      timeout = setTimeout(() => {
        setState(position ? "show" : "hide")

        if (!position) {
          return update()
        }

        const [x, y, target] = position

        try {
          const rect = measureScope(target)
          const cursorX =
            ((rect.x + document.documentElement.scrollLeft + x * rect.width) /
              document.documentElement.offsetWidth) *
            100

          const cursorY =
            ((rect.y + document.documentElement.scrollTop + y * rect.height) /
              document.documentElement.offsetHeight) *
            100

          if (pc.prevPoint) {
            pc.addPoint([cursorX, cursorY])
          } else {
            pc.prevPoint = [cursorX, cursorY]
          }
        } catch (error) {
          if (process.env.NODE_ENV === "development") throw error
        } finally {
          update()
        }
      }, delta)
    }

    const cleanupOnMessage = onMessage("update", ([cursorId, positions]) => {
      if (cursorId !== id) return
      queue.push(...positions)
      if (timeout) return
      update()
    })

    return () => {
      cleanupOnMessage()
      if (timeout) clearTimeout(timeout)
    }
  }, [id, pc])

  return (
    <AnimatePresence>
      {state === "show" ? (
        <motion.div
          className="absolute inset-0 select-none"
          style={{ transform }}
        >
          <Icon
            src="cursor"
            alt=""
            className="drop-shadow-cursor"
            style={{ color }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

const atomRoomIds = computed(atomRoom, (room) => Object.keys(room))

type Props = {
  colors: string[]
}

export default function CursorsClient({ colors }: Props) {
  const scroll = useScroll()
  const roomIds = useStore(atomRoomIds)

  useEffect(() => {
    const unsubscribeHandshake = onMessage("handshake", (room) => {
      atomRoom.set(room)
    })

    const unsubscribeUpdate = onMessage("update", ([id, positions]) => {
      const lastPosition = positions[positions.length - 1] || null
      atomRoom.set({
        ...atomRoom.get(),
        [id]: lastPosition?.[1] || null,
      })
    })

    const unsubscribeDisconnect = onMessage("disconnect", (id) => {
      // TODO: test if the spread is neccesary. Maybe it's not the same reference
      const room = { ...atomRoom.get() }
      delete room[id]
      atomRoom.set(room)
    })

    return () => {
      unsubscribeHandshake()
      unsubscribeUpdate()
      unsubscribeDisconnect()
    }
  }, [])

  useEffect(() => {
    const cleanupScrollY = scroll.scrollY.on("change", () => {
      measurements.clear()
    })

    const cleanupMeasure = resize(document.documentElement, () => {
      measurements.delete(document.documentElement)
    })

    return () => {
      cleanupScrollY()
      cleanupMeasure()
    }
  }, [scroll.scrollY])

  return (
    <div>
      {roomIds.map((id, index) => (
        <Cursor key={id} id={id} color={colors[index % colors.length]} />
      ))}
    </div>
  )
}

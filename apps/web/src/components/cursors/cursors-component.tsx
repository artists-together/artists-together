"use client"

import type { CursorPosition, CursorPositions } from "@artists-together/core/ws"
import {
  AnimatePresence,
  motion,
  Point,
  useMotionTemplate,
  useSpring,
} from "motion/react"
import { computed } from "nanostores"
import { useEffect, useState } from "react"
import Icon from "@/components/icon"
import { atomRoom, getWindowSize } from "@/lib/cursors"
import { cursorPresenceVariants } from "@/lib/motion"
import { useStore } from "@/lib/nanostores"
import { shuffle } from "@/lib/utils"
import { onMessage } from "@/lib/ws"
import { colors } from "../../../tailwind.config"

const COLORS = shuffle([
  colors["acrylic-red"][400],
  colors["print-blue"][400],
  colors["microscopic-green"][400],
  colors["physical-orange"][400],
  colors["ruler-cyan"][400],
  colors["froggy-lime"][400],
  colors["smiley-yellow"][300],
  colors["milky-brown"][400],
  colors["tuxedo-crimson"][300],
  colors["anamorphic-teal"][400],
  colors["outsider-violet"][400],
  colors["plushie-pink"][400],
])

function getCursorPosition([x, y]: NonNullable<CursorPosition>): Point {
  const windowSize = getWindowSize()
  return {
    x: (x * 100 * windowSize.width) / windowSize.width,
    y: (y * 100 * windowSize.height) / windowSize.height,
  }
}

function Cursor({
  color,
  id,
  point,
}: {
  color: string
  id: string
  point?: Point
}) {
  const [state, setState] = useState<"hide" | "show">(point ? "show" : "hide")
  const x = useSpring(point?.x || 0)
  const y = useSpring(point?.y || 0)
  const transform = useMotionTemplate`translateX(${x}%) translateY(${y}%)`

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined = undefined
    const queue: CursorPositions = []

    function update() {
      const current = queue.shift()

      if (!current) {
        return
      }

      const [delta, position] = current

      timeout = setTimeout(() => {
        setState(position ? "show" : "hide")

        if (!position) {
          return update()
        }

        const point = getCursorPosition(position)
        x.set(point.x)
        y.set(point.y)
        update()
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
      if (timeout) {
        clearTimeout(timeout)
        timeout = undefined
      }
    }
  }, [id, x, y])

  return (
    <motion.div className="absolute inset-0 select-none" style={{ transform }}>
      <motion.div
        className="inline-block origin-top-left"
        initial="hide"
        animate={state}
        exit="hide"
        variants={cursorPresenceVariants}
      >
        <Icon
          src="cursor"
          alt=""
          className="drop-shadow-cursor"
          width={23}
          height={31}
          style={{ color }}
        />
      </motion.div>
    </motion.div>
  )
}

const atomRoomIds = computed(atomRoom, (room) => Object.keys(room))

export default function CursorsComponent() {
  const roomIds = useStore(atomRoomIds)

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 hidden size-full select-none overflow-hidden sm:block"
      aria-hidden
    >
      <AnimatePresence>
        {roomIds.map((id, index) => {
          const cursor = atomRoom.get()[id]
          const cursorPoint = cursor ? getCursorPosition(cursor) : undefined
          return (
            <Cursor
              key={id}
              id={id}
              color={COLORS[index % COLORS.length]}
              point={cursorPoint}
            />
          )
        })}
      </AnimatePresence>
    </div>
  )
}

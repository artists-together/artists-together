"use client"

import type { NullablePosition, Room } from "@artists-together/core/ws"
import {
  cancelFrame,
  frame,
  motion,
  Process,
  resize,
  useMotionTemplate,
  useSpring,
} from "motion/react"
import { AnimatePresence, useScroll } from "motion/react"
import { PerfectCursor } from "perfect-cursors"
import { useEffect, useState } from "react"
import { DATA_ATTR_SCOPE, measure, measurements } from "@/lib/cursors"
import { shuffle } from "@/lib/utils"
import { colors } from "../../tailwind.config"
import Icon from "./icon"

const CURSOR_COLORS = shuffle([
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

function Cursor({
  color,
  position,
}: {
  color: string
  position: NullablePosition
}) {
  const x = useSpring(position ? position[1] : 0)
  const y = useSpring(position ? position[2] : 0)
  const transform = useMotionTemplate`translateX(${x}%) translateY(${y}%)`

  const [pc] = useState(
    () =>
      new PerfectCursor((point) => {
        if (typeof point[0] === "number" && typeof point[1] === "number") {
          x.set(point[0])
          y.set(point[1])
        }
      }),
  )

  useEffect(() => {
    if (!position) {
      pc.dispose()
      pc.queue = []
      pc.prevPoint = undefined
    }
  }, [pc, position])

  useEffect(() => {
    if (!position?.[0]) return

    let rect = measurements.get(position[0])

    if (!rect) {
      const scope = document.querySelector(`[${DATA_ATTR_SCOPE}]`)

      if (!scope) {
        console.error(`Unable to select sope: ${DATA_ATTR_SCOPE}`)
        return
      }

      rect = measure(position[0], scope)
    }

    const x =
      ((rect.x +
        document.documentElement.scrollLeft +
        position[1] * rect.width) /
        document.documentElement.offsetWidth) *
      100

    const y =
      ((rect.y +
        document.documentElement.scrollTop +
        position[2] * rect.height) /
        document.documentElement.offsetHeight) *
      100

    if (pc.prevPoint) {
      pc.addPoint([x, y])
    } else {
      pc.prevPoint = [x, y]
    }
  }, [pc, position])

  return (
    <AnimatePresence>
      {position ? (
        <motion.div
          className="absolute left-0 top-0 select-none"
          style={{ x, y }}
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

export default function Cursors() {
  const [room, setRoom] = useState<Room>([
    [crypto.randomUUID(), ["root", 13, 12]],
    [crypto.randomUUID(), ["root:logo", 10, 35]],
  ])

  const scroll = useScroll()

  useEffect(() => {
    const cleanupScrollY = scroll.scrollY.on("change", () => {
      console.log("Clearing all measurements")
      measurements.clear()
    })

    const cleanupMeasure = resize(document.documentElement, () => {})

    return () => {
      cleanupScrollY()
      cleanupMeasure()
    }
  }, [scroll.scrollY])

  return (
    <div>
      {room.map(([key, position], index) => (
        <Cursor
          key={key}
          color={CURSOR_COLORS[index % CURSOR_COLORS.length]}
          position={position}
        />
      ))}
    </div>
  )
}

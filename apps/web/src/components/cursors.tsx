"use client"

import type { messages } from "@artists-together/core/ws"
import { motion, resize, useMotionTemplate, useSpring } from "motion/react"
import { AnimatePresence, useScroll } from "motion/react"
import { useEffect, useState } from "react"
import {
  cursorsStore,
  DATA_ATTR_SCOPE,
  measure,
  measurements,
  PerfectCursor,
} from "@/lib/cursors"
import { shuffle } from "@/lib/utils"
import { colors } from "../../tailwind.config"
import Icon from "./icon"
import { onMessage } from "@/lib/ws"
import { useStore } from "zustand"
import { useShallow } from "zustand/shallow"

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

function Cursor({ color, id }: { color: string; id: string }) {
  // const x = useSpring(position ? position[1] : 0)
  // const y = useSpring(position ? position[2] : 0)
  // const transform = useMotionTemplate`translateX(${x}%) translateY(${y}%)`

  useEffect(() => {
    const sub = cursorsStore.subscribe(
      (room) => room.room.find(([cursorId]) => cursorId === id),
      ([]) => {},
    )
  })

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
    // if (!position) {
    //   pc.dispose()
    //   pc.queue = []
    //   pc.prevPoint = undefined
    // }
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
  const scroll = useScroll()
  const cursors = useStore(
    cursorsStore,
    useShallow((store) => store.room.map(([id]) => id)),
  )

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
      {cursors.map((id, index) => (
        <Cursor
          key={id}
          id={id}
          color={CURSOR_COLORS[index % CURSOR_COLORS.length]}
        />
      ))}
    </div>
  )
}

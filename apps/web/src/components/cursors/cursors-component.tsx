"use client"

import type { CursorPosition, CursorPositions } from "@artists-together/core/ws"
import { motion, useMotionTemplate, useSpring } from "motion/react"
import { computed } from "nanostores"
import { useEffect } from "react"
import Icon from "@/components/icon"
import { atomRoom, getDocumentSize, Point2D } from "@/lib/cursors"
import { createCriticallyDampedSpring } from "@/lib/motion"
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

function getCursorPosition([x, y]: NonNullable<CursorPosition>): Point2D {
  const rect = getDocumentSize()
  const pointX = (x * 100 * rect.width) / rect.width
  const pointY = (y * 100 * rect.height) / rect.height
  return [pointX, pointY]
}

const scaleSpring = createCriticallyDampedSpring({
  mass: 1,
  stiffness: 100,
})

function Cursor({
  color,
  id,
  point,
}: {
  color: string
  id: string
  point?: Point2D
}) {
  const x = useSpring(point?.[0] || 0)
  const y = useSpring(point?.[1] || 0)
  const scale = useSpring(0, scaleSpring)
  const transform = useMotionTemplate`translateX(${x}%) translateY(${y}%)`

  useEffect(() => {
    scale.set(point ? 1 : 0)
  }, [point, scale])

  // const [pc] = useState(
  //   () =>
  //     new PerfectCursor((point) => {
  //       x.set(point[0])
  //       y.set(point[1])
  //     }),
  // )

  // // Dispose the internal PerfectCursor timeout
  // useEffect(() => {
  //   return () => {
  //     pc.dispose()
  //   }
  // }, [pc])

  // Reset PerfectCursor state when hidden

  useEffect(() => {
    // if (cursor) {
    //     const point = getCursorPosition(cursor)
    //     x.jump(point[0])
    //     y.jump(point[1])
    //     setState("show")
    // }
  }, [x, y])

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined = undefined
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
        scale.set(position ? 1 : 0)

        if (!position) {
          return update()
        }

        const point = getCursorPosition(position)
        x.set(point[0])
        y.set(point[1])
        // if (pc.prevPoint) {
        //   pc.addPoint(point)
        // } else {
        //   pc.prevPoint = point
        // }
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
  }, [id, scale, x, y])

  return (
    <motion.div
      className="absolute inset-0 select-none"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      style={{ transform }}
    >
      <motion.div style={{ scale }} className="inline-block origin-top-left">
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
      className="pointer-events-none absolute inset-0 z-50 size-full select-none overflow-hidden"
      aria-hidden
    >
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
    </div>
  )
}

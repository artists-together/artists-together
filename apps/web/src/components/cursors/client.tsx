"use client"

import { motion, resize, useSpring } from "motion/react"
import { AnimatePresence, useScroll } from "motion/react"
import { computed } from "nanostores"
import { useEffect, useState } from "react"
import Icon from "@/components/icon"
import { atomRoom, measurements } from "@/lib/cursors"
import { useStore } from "@/lib/nanostores"
import { onMessage } from "@/lib/ws"

function Cursor({ color, id }: { color: string; id: string }) {
  const [state, setState] = useState<"hide" | "show">("show") // TODO: swap back to hide
  const x = useSpring(0)
  const y = useSpring(0)

  useEffect(() => {
    const atom = computed(atomRoom, (room) => room[id])
  }, [id])

  useEffect(() => {
    return onMessage("update", ([cursorId, position]) => {
      if (cursorId !== id) return
      // TODO: do something with position
    })
  }, [id])

  // useEffect(() => {
  //   const sub = cursorsStore.subscribe(
  //     (room) => room.room.find(([cursorId]) => cursorId === id),
  //     ([]) => {},
  //   )
  // })

  // const [pc] = useState(
  //   () =>
  //     new PerfectCursor((point) => {
  //       if (typeof point[0] === "number" && typeof point[1] === "number") {
  //         x.set(point[0])
  //         y.set(point[1])
  //       }
  //     }),
  // )

  // useEffect(() => {
  //   // if (!position) {
  //   //   pc.dispose()
  //   //   pc.queue = []
  //   //   pc.prevPoint = undefined
  //   // }
  // }, [pc, position])

  // useEffect(() => {
  //   if (!position?.[0]) return

  //   let rect = measurements.get(position[0])

  //   if (!rect) {
  //     const scope = document.querySelector(`[${DATA_ATTR_SCOPE}]`)

  //     if (!scope) {
  //       console.error(`Unable to select sope: ${DATA_ATTR_SCOPE}`)
  //       return
  //     }

  //     rect = measure(position[0], scope)
  //   }

  //   const x =
  //     ((rect.x +
  //       document.documentElement.scrollLeft +
  //       position[1] * rect.width) /
  //       document.documentElement.offsetWidth) *
  //     100

  //   const y =
  //     ((rect.y +
  //       document.documentElement.scrollTop +
  //       position[2] * rect.height) /
  //       document.documentElement.offsetHeight) *
  //     100

  //   if (pc.prevPoint) {
  //     pc.addPoint([x, y])
  //   } else {
  //     pc.prevPoint = [x, y]
  //   }
  // }, [pc, position])

  return (
    <AnimatePresence>
      {state === "show" ? (
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

    const unsubscribeDisconnect = onMessage("disconnect", (id) => {
      // TODO: test if the spread is neccesary. Maybe it's not the same reference
      const room = { ...atomRoom.get() }
      delete room[id]
      atomRoom.set(room)
    })

    return () => {
      unsubscribeHandshake()
      unsubscribeDisconnect()
    }
  }, [])

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
      {roomIds.map((id, index) => (
        <Cursor key={id} id={id} color={colors[index % colors.length]} />
      ))}
    </div>
  )
}

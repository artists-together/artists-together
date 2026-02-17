import { Room } from "@artists-together/core/ws"
import { resize } from "framer-motion"
import { atom, computed } from "nanostores"
import { onMessage } from "./ws"

export const atomRoom = atom<Room>({})

export const atomWindowSize = atom<Pick<
  DOMRectReadOnly,
  "width" | "height"
> | null>(null)

if (typeof window !== "undefined") {
  resize((rect) => {
    atomWindowSize.set(rect)
  })

  onMessage("handshake", (room) => {
    atomRoom.set(room)
  })

  onMessage("update", ([id, positions]) => {
    const lastPosition = positions[positions.length - 1] || null
    atomRoom.set({
      ...atomRoom.get(),
      [id]: lastPosition?.[1] || null,
    })
  })

  onMessage("disconnect", (id) => {
    const room = { ...atomRoom.get() }
    delete room[id]
    atomRoom.set(room)
  })
}

export function getWindowSize() {
  const atom = atomWindowSize.get()
  if (atom) return atom
  const width = window.innerWidth
  const height = window.innerHeight
  atomWindowSize.set({ width, height })
  return { width, height }
}

export const atomCursorX = atom(0.5)

export const atomCursorY = atom(0.5)

export const atomCursor = computed(
  [atomCursorX, atomCursorY],
  (x, y) => [x, y] as const,
)

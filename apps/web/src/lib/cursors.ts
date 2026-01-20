import { Room } from "@artists-together/core/ws"
import { Point } from "motion"
import { atom } from "nanostores"
import { onMessage } from "./ws"

export const DATA_ATTR_SCOPE = "data-scope"

export const atomRoom = atom<Room>({})

export const atomDocumentSize = atom<Pick<
  DOMRectReadOnly,
  "width" | "height"
> | null>(null)

if (typeof window !== "undefined") {
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

export function getDocumentSize() {
  const atom = atomDocumentSize.get()
  if (atom) return atom
  const rect = document.documentElement.getBoundingClientRect()
  atomDocumentSize.set(rect)
  return rect
}

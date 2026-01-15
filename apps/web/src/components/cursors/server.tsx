import "server-only"
import { shuffle } from "@/lib/utils"
import { colors } from "../../../tailwind.config"
import CursorsClient from "./client"

export default function Cursors() {
  return (
    <CursorsClient
      colors={shuffle([
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
      ])}
    />
  )
}

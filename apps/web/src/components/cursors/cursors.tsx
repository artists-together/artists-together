"use client"

import dynamic from "next/dynamic"
import { useScreen } from "@/lib/tailwind"

const CursorsComponent = dynamic(() => import("./cursors-component"), {
  ssr: false,
})

export default function Cursors() {
  return useScreen("sm") ? <CursorsComponent /> : null
}

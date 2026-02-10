"use client"

import dynamic from "next/dynamic"

const CursorsComponent = dynamic(() => import("./cursors-component"), {
  ssr: false,
})

export default function Cursors() {
  return <CursorsComponent />
}

"use client"
import dynamic from "next/dynamic"
import { Suspense } from "react"

const CursorsComponent = dynamic(() => import("./cursors-component"), {
  ssr: false,
})

export default function Cursors() {
  return (
    <Suspense fallback={<div>loading</div>}>
      <CursorsComponent />
    </Suspense>
  )
}

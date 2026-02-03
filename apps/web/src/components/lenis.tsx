"use client"

import LenisInstance from "lenis"
import { cancelFrame, frame, FrameData, resize } from "motion"
import { ComponentProps, ComponentRef, useEffect, useRef } from "react"

export default function Lenis(props: ComponentProps<"div">) {
  // const lenisRef = useRef()
  const ref = useRef<ComponentRef<"div">>(null)

  useEffect(() => {
    if (!ref.current) return

    const lenis = new LenisInstance({
      autoRaf: false,
      autoResize: false,
    })

    const cancelResize = resize(ref.current, () => {
      lenis.resize()
    })

    function update(data: FrameData) {
      lenis.raf(data.timestamp)
    }

    frame.update(update, true)
    return () => {
      cancelFrame(update)
      cancelResize()
      lenis.destroy()
    }
  }, [])

  return <div {...props} ref={ref} data-lenis-scroll-root />
}

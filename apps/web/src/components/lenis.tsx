"use client"

import LenisInstance from "lenis"
import { cancelFrame, frame, FrameData, resize } from "motion"
import { ComponentProps, RefCallback, useCallback } from "react"

export default function Lenis(props: ComponentProps<"div">) {
  const ref = useCallback<RefCallback<HTMLElement>>((element) => {
    if (!element) return

    const lenis = new LenisInstance({
      autoRaf: false,
      autoResize: false,
    })

    const cancelResize = resize(element, () => {
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

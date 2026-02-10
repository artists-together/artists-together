"use client"

import lottie from "lottie-web/build/player/lottie_svg"
import { ComponentProps, ComponentRef, RefCallback, useCallback } from "react"
import animationData from "@/assets/lottie/at_logo_25.json"

export default function Logo(props: ComponentProps<"div">) {
  const refLottie = useCallback<RefCallback<ComponentRef<"div">>>(
    (container) => {
      if (!container) return

      const animation = lottie.loadAnimation({
        animationData,
        container,
        loop: false,
        rendererSettings: {
          className: "lottie",
          viewBoxOnly: true,
        },
      })

      return () => {
        animation.destroy()
      }
    },
    [],
  )

  return <div {...props} ref={refLottie} />
}

import { SpringOptions, Transition, Variants } from "motion"
import { MotionStyle, useReducedMotion, useSpring } from "motion/react"
import { useEffect } from "react"
import { atomCursor } from "./cursors"

/**
 *
 * Critical damping occurs when damping ≈ 2 * sqrt(stiffness * mass).
 * With mass = 1, choose stiffness that feels snappy but natural and
 * compute damping accordingly.
 */
export function createCriticallyDampedSpring({
  mass,
  stiffness,
  ...rest
}: SpringOptions &
  Required<Pick<SpringOptions, "mass" | "stiffness">>): Transition {
  return {
    ...rest,
    type: "spring",
    mass,
    stiffness,
    damping: 2 * Math.sqrt(stiffness),
    bounce: 0,
  }
}

export const cursorPresenceVariants = {
  hide: {
    scale: 0,
    transition: {
      type: "spring",
      mass: 0.15,
      stiffness: 200,
    },
  },
  show: {
    scale: 1,
    transition: {
      type: "spring",
      mass: 0.05,
      stiffness: 200,
    },
  },
} satisfies Variants

export function useCursorParallax({
  spring,
  amount = 1,
}: {
  spring?: SpringOptions
  amount?: number
}) {
  const reducedMotion = useReducedMotion()
  const x = useSpring("0%", spring)
  const y = useSpring("0%", spring)

  useEffect(() => {
    if (reducedMotion) {
      x.set("0%")
      y.set("0%")
      return
    }

    return atomCursor.listen(([cursorX, cursorY]) => {
      x.set(`${-cursorX * amount}%`)
      y.set(`${-cursorY * amount}%`)
    })
  }, [amount, reducedMotion, x, y])

  return { x, y } satisfies MotionStyle
}

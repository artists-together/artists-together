import { SpringOptions, Transition } from "motion"

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

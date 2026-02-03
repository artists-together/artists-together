"use client"

import {
  motion,
  scroll,
  stagger,
  useAnimate,
  useScroll,
  useTransform,
} from "motion/react"
import { ComponentRef, PropsWithChildren, useEffect, useRef } from "react"
import Cursors from "@/components/cursors"
import Lenis from "@/components/lenis"
import Logo from "@/components/logo"
import Navigation from "@/components/navigation"

const CATEGORIES = [
  "drawing",
  "modelling",
  "refurbishing",
  "sculpting",
  "composing",
  "filming",
  "writing",
  "singing",
  "building",
  "dancing",
  "developing",
  "designing",
  "acting",
  "crafting",
  "illustrating",
  "performing",
  "animating",
  "photographing",
]

const GOLDEN_ANGLE = 137.50776405003785
const PARTICLE_RADIUS_BASE = 4
const PARTICLE_RADIUS_SCALE = 2
const PARTICLE_RADIUS_STEP = 0.6
const PARTICLE_RADIUS_JITTER = 2
const PARTICLE_ANGLE_JITTER = 40

function deterministicRandom(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453123
  return value - Math.floor(value)
}

function getParticleTransform(index: number) {
  const jitter = deterministicRandom(index) - 0.5
  const angle = index * GOLDEN_ANGLE + jitter * PARTICLE_ANGLE_JITTER
  const radius =
    (PARTICLE_RADIUS_BASE +
      index * PARTICLE_RADIUS_STEP +
      jitter * PARTICLE_RADIUS_JITTER) *
    PARTICLE_RADIUS_SCALE
  const rad = (angle * Math.PI) / 180
  const x = Number(Math.cos(rad) * radius).toFixed(5)
  const y = Number(Math.sin(rad) * radius).toFixed(5)
  return `translate(${x}vw, ${y}vw)`
}

function Particles() {
  const [ref, animate] = useAnimate()

  useEffect(() => {
    const animation = animate(
      "li",
      {
        filter: ["blur(8px)", "blur(0px)", "blur(8px)"],
        opacity: [0, 1, 0],
        scale: [0.5, 1, 2],
      },
      {
        ease: "linear",
        delay: stagger(0.1),
      },
    )

    return scroll(animation, {
      target: ref.current,
    })
  }, [animate, ref])

  return (
    <div ref={ref} className="relative h-[500svh]">
      <ul className="sticky top-0 grid h-svh place-items-center overflow-x-clip whitespace-nowrap text-center *:opacity-0 *:[grid-area:1/1]">
        {CATEGORIES.map((category, index) => (
          <li key={category}>
            <span
              className="inline-block"
              style={{
                transform: getParticleTransform(index),
              }}
            >
              {category}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Header() {
  const ref = useRef<ComponentRef<"div">>(null)

  const scroll = useScroll({
    target: ref,
    offset: ["start center", "end center"],
  })

  const style = useTransform(scroll.scrollYProgress, [0.5, 0.75], {
    filter: ["blur(0px)", "blur(32px)"],
    opacity: [1, 0],
    scale: [1, 5],
    y: ["0%", "-10%"],
  })

  return (
    <div ref={ref} className="relative -mb-[100svh] overflow-x-clip">
      <h1 className="sr-only">Artists Together</h1>
      <motion.div className="grid h-svh place-items-center" style={style}>
        <div className="relative mx-auto aspect-[200/108] w-full max-w-[28.75rem]">
          <Logo />
        </div>
      </motion.div>
      <div className="absolute inset-x-2 bottom-2 grid place-items-center">
        <a
          href="#content"
          className="rounded-3.5 p-2 text-center font-fraunces text-base font-light lowercase"
        >
          Scroll to explore
        </a>
      </div>
    </div>
  )
}

function Scroll({
  children,
  position,
}: PropsWithChildren<{ debug?: boolean; position?: "last" }>) {
  const ref = useRef<ComponentRef<"div">>(null)

  const scroll = useScroll({
    target: ref,
    offset: ["start center", "end center"],
  })

  const style = useTransform(scroll.scrollYProgress, [0, 0.25, 0.5, 0.75], {
    filter: [
      "blur(32px)",
      "blur(0px)",
      "blur(0px)",
      position === "last" ? "blur(0px)" : "blur(32px)",
    ],
    opacity: [0, 1, 1, position === "last" ? 1 : 0],
    scale: [0.75, 1, 1, position === "last" ? 1 : 5],
    y: ["0%", "0%", "0%", position === "last" ? "0%" : "-10%"],
  })

  return (
    <div className="relative -mb-[300svh] h-[500svh] overflow-x-clip last:h-[300svh] [&:nth-last-child(2)]:-mb-[200svh]">
      <motion.div
        className="sticky top-0 grid h-svh place-items-center"
        style={style}
      >
        {children}
      </motion.div>
      <div
        ref={ref}
        className="pointer-events-none absolute inset-x-0 bottom-0 top-0"
      />
    </div>
  )
}

export default function Page() {
  return (
    <Lenis>
      <header className="relative">
        <Navigation />
        <Header />
      </header>
      <main
        id="content"
        className="relative text-center font-fraunces font-light sm:text-[2.083vw]"
      >
        <Scroll>
          Artists Together is a worldwide, inclusive, and diverse
          <br />
          community for all kinds of artists and skill levels.
        </Scroll>
        <Scroll>
          We want to give artists from around the globe a place to share,
          <br /> learn, and talk with other creative folks.
        </Scroll>
        <Scroll>
          We celebrate creativity, diversity,
          <br /> entertainment, and learning.
        </Scroll>
        <Particles />
        <Scroll>
          So, create, share, and enjoy,
          <br /> because we are glad to have you here.
        </Scroll>
        <Scroll position="last">Artists, together.</Scroll>
      </main>
      <Cursors />
    </Lenis>
  )
}

"use client"

import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  wrap,
} from "motion/react"
import { ComponentRef, PropsWithChildren, useEffect, useRef } from "react"
import Cursors from "@/components/cursors"
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

function Particles() {
  return (
    <div className="relative h-full">
      {CATEGORIES.map((category) => (
        <div key={category} className="absolute left-0 top-0">
          {category}
        </div>
      ))}
    </div>
  )
}

function Scroll({ children, debug }: PropsWithChildren<{ debug?: boolean }>) {
  const refContainer = useRef<ComponentRef<"div">>(null)
  const refStart = useRef<ComponentRef<"div">>(null)
  const refEnd = useRef<ComponentRef<"div">>(null)

  // const ref = useRef<ComponentRef<"div">>(null)
  const scrollContainer = useScroll({
    target: refContainer,
    offset: ["start start", "end end"],
  })

  const scrollEnd = useScroll({
    target: refEnd,
    offset: ["start center", "end start"],
  })

  // useMotionValueEvent(scrollContainer.scrollYProgress, "change", (e) => {
  //   if (debug) console.log(e)
  // })

  // const scale = useTransform(
  //   scrollContainer.scrollYProgress,
  //   [0, 0.5, 1],
  //   [0, 1, 2],
  // )

  const style = useTransform(scrollEnd.scrollYProgress, [0, 1], {
    scale: [1, 5],
    y: ["0%", "-10%"],
    opacity: [1, 0],
    filter: ["blur(0px)", "blur(64px)"],
  })

  return (
    <div
      ref={refContainer}
      className="relative -mb-[100svh] h-[500svh] overflow-x-clip"
    >
      <motion.div
        className="sticky top-0 grid h-dvh place-items-center"
        style={style}
      >
        {children}
      </motion.div>
      <div ref={refEnd} className="absolute inset-x-0 bottom-[100svh] h-svh" />
    </div>
  )
}

export default function Page() {
  return (
    <>
      <header className="relative">
        <Navigation />
        <h1 className="sr-only">Artists Together</h1>
        <Scroll>
          <div className="relative mx-auto aspect-[2000/1080] w-full max-w-[28.75rem]">
            <Logo />
          </div>
          <div className="absolute inset-x-2 bottom-2 grid place-items-center">
            <a
              href="#content"
              className="rounded-3.5 p-2 text-center font-fraunces text-base font-light lowercase"
            >
              Scroll to explore
            </a>
          </div>
        </Scroll>
      </header>
      <main
        id="content"
        className="relative text-center font-fraunces font-light sm:text-[2.083vw]"
      >
        <Scroll debug>
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
        {/*<Scroll>
          <Particles />
        </Scroll>*/}
        <Scroll>
          So, create, share, and enjoy,
          <br /> because we are glad to have you here.
        </Scroll>
        <Scroll>Artists, together.</Scroll>
      </main>
      <Cursors />
    </>
  )
}

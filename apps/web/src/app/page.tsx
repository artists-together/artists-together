"use client"

import { motion, useScroll, useTransform } from "motion/react"
import { ComponentRef, PropsWithChildren, useRef } from "react"
import CursorScope from "@/components/cursor-scope"
import Logo from "@/components/logo"
import Navigation from "@/components/navigation"

function Scroll({ children }: PropsWithChildren) {
  const ref = useRef<ComponentRef<"div">>(null)
  const scroll = useScroll({
    target: ref,
  })

  const scale = useTransform(scroll.scrollYProgress, [0, 0.5, 1], [0, 1, 2])

  return (
    <div ref={ref} className="relative h-[500dvh]">
      <motion.div className="sticky top-0 grid h-dvh place-items-center">
        {children}
      </motion.div>
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
            <CursorScope scope="logo" className="absolute inset-0 size-full">
              <Logo />
            </CursorScope>
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
        className="relative text-center font-fraunces text-[2.5rem] font-light"
      >
        <Scroll>
          Artists Together is a worldwide, inclusive, and diverse community for
          all kinds of artists and skill levels.
        </Scroll>
        <Scroll>
          We want to give artists from around the globe a place to share, learn,
          and talk with other creative folks.
        </Scroll>
        <Scroll>
          We celebrate creativity, diversity, entertainment, and learning.
        </Scroll>
        <Scroll>
          So, create, share, and enjoy, because we are glad to have you here.
        </Scroll>
        <Scroll>Artists, together.</Scroll>
      </main>
      {/*<Cursors />*/}
    </>
  )
}

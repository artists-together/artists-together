"use client"

import clsx from "clsx"
import {
  motion,
  scroll,
  stagger,
  useAnimate,
  useScroll,
  useTransform,
} from "motion/react"
import {
  ComponentRef,
  CSSProperties,
  PropsWithChildren,
  useEffect,
  useRef,
} from "react"
import Cursors from "@/components/cursors"
import Icon from "@/components/icon"
import Lenis from "@/components/lenis"
import Logo from "@/components/logo"
import Navigation from "@/components/navigation"
import Stars from "@/components/stars"

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

function getParticleTransform(index: number) {
  return {
    "--x": `${index * 10}%`,
    "--y": "0%",
  } as CSSProperties
}

function Particles() {
  const [ref, animate] = useAnimate()

  useEffect(() => {
    const animation = animate(
      "span",
      {
        filter: [
          "blur(32px)",
          "blur(16px)",
          "blur(0px)",
          "blur(0px)",
          "blur(32px)",
        ],
        opacity: [0, 0.5, 1, 0.5, 0],
        scale: [0, 0.5, 1, 1.5, 2],
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
    <div ref={ref} className="relative -mb-[250svh] h-[500svh] overflow-x-clip">
      <ul className="sticky top-0 flex flex-col items-start">
        {CATEGORIES.map((category, index) => (
          <li
            key={category}
            className="relative left-[--x]"
            style={getParticleTransform(index)}
          >
            <span className="inline-block text-center">{category}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function HeroAnchor() {
  const scroll = useScroll()
  const style = useTransform(scroll.scrollY, [0, 40], {
    filter: ["blur(0px)", "blur(24px)"],
    opacity: [1, 0],
  })

  return (
    <div className="fixed inset-x-2 bottom-2 grid place-items-center">
      <motion.a
        href="#content"
        className="rounded-3.5 p-2 text-center font-fraunces text-base font-light lowercase"
        style={style}
      >
        Scroll to explore
      </motion.a>
    </div>
  )
}

function Hero() {
  const ref = useRef<ComponentRef<"div">>(null)

  const scroll = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  })

  const style = useTransform(scroll.scrollYProgress, [0, 1], {
    filter: ["blur(0px)", "blur(32px)"],
    opacity: [1, 0],
    scale: [1, 5],
  })

  return (
    <div
      ref={ref}
      className="relative -mb-[250svh] h-[250svh] overflow-x-clip noscript:mb-0 noscript:h-svh"
    >
      <h1 className="sr-only">Artists Together</h1>
      <motion.div
        className="sticky top-0 grid h-svh place-items-center"
        style={style}
      >
        <div className="relative mx-auto aspect-[200/108] w-full max-w-[28.75rem]">
          <Logo />
          <noscript>
            <Icon
              src="logo"
              alt=""
              viewBox="0 0 2000 1080"
              className="size-full"
            />
          </noscript>
        </div>
      </motion.div>
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
    offset: ["start start", "end end"],
  })

  const style = useTransform(
    scroll.scrollYProgress,
    position === "last" ? [0, 1] : [0, 0.25, 0.5, 0.75, 1],
    position === "last"
      ? {
          filter: ["blur(32px)", "blur(0px)"],
          opacity: [0, 1],
          scale: [0, 1],
        }
      : {
          filter: [
            "blur(32px)",
            "blur(16px)",
            "blur(0px)",
            "blur(0px)",
            "blur(32px)",
          ],
          opacity: [0, 0.5, 1, 0.5, 0],
          scale: [0, 0.5, 1, 1.5, 2],
        },
  )

  return (
    <div
      ref={ref}
      className={clsx(
        "relative overflow-x-clip noscript:mb-0 noscript:h-svh",
        position === "last" ? "h-[250svh]" : "-mb-[250svh] h-[500svh]",
      )}
    >
      <motion.div
        className={clsx(
          "sticky top-0 grid h-svh place-items-center",
          "noscript:mb-0 noscript:h-svh noscript:!scale-100 noscript:!opacity-100 noscript:!blur-0",
        )}
        style={style}
      >
        {children}
      </motion.div>
    </div>
  )
}

export default function Page() {
  return (
    <>
      <Stars />
      <Lenis>
        <header className="relative">
          <Navigation />
          <Hero />
          <HeroAnchor />
        </header>
        <main
          id="content"
          className="relative text-center font-fraunces text-[4.75vw] font-light sm:text-[2.083vw]"
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
    </>
  )
}

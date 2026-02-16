"use client"

import clsx from "clsx"
import {
  motion,
  scroll,
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
import { useCursorParallax } from "@/lib/motion"

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

const CATEGORY_COLORS = [
  "text-plushie-pink-400",
  "text-microscopic-green-400",
  "text-smiley-yellow-400",
]

function mulberry32(seed: number) {
  let t = seed
  return () => {
    t += 0x6d2b79f5
    let x = t
    x = Math.imul(x ^ (x >>> 15), x | 1)
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

function createShuffledOrder(count: number, seed: number) {
  const order = Array.from({ length: count }, (_, index) => index)
  const random = mulberry32(seed)

  for (let index = order.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    const current = order[index]
    order[index] = order[swapIndex]
    order[swapIndex] = current
  }

  return order
}

function createOrderRank(order: number[]) {
  const rank = new Array<number>(order.length).fill(0)
  for (let index = 0; index < order.length; index += 1) {
    rank[order[index]] = index
  }
  return rank
}

const PARTICLE_ANIMATION_ORDER = createShuffledOrder(CATEGORIES.length, 913)

const PARTICLE_ANIMATION_RANK = createOrderRank(PARTICLE_ANIMATION_ORDER)

const PARTICLE_OFFSET = [
  { x: "35%", y: "19%" },
  { x: "-36%", y: "18%" },
  { x: "34%", y: "87%" },
  { x: "28%", y: "9%" },
  { x: "20%", y: "60%" },
  { x: "-11%", y: "80%" },
  { x: "-32%", y: "34%" },
  { x: "-28%", y: "60%" },
  { x: "8%", y: "24%" },
  { x: "23%", y: "46%" },
  { x: "17%", y: "32%" },
  { x: "12%", y: "83%" },
  { x: "4%", y: "52%" },
  { x: "-40%", y: "85%" },
  { x: "0%", y: "50%" },
  { x: "-11%", y: "8%" },
  { x: "27%", y: "69%" },
  { x: "-19%", y: "40%" },
]

function Particles() {
  const [ref, animate] = useAnimate()
  const parallaxStyle = useCursorParallax({ amount: 0.3 })

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
        delay: (index) => PARTICLE_ANIMATION_RANK[index] * 0.1,
      },
    )
    return scroll(animation, {
      target: ref.current,
    })
  }, [animate, ref])

  return (
    <div
      ref={ref}
      className="relative -mb-[250svh] -mt-[350svh] h-[1000svh] overflow-x-clip"
    >
      <motion.ul className="sticky top-0 h-svh" style={parallaxStyle}>
        {CATEGORIES.map((category, index) => {
          const offset = PARTICLE_OFFSET[index % PARTICLE_OFFSET.length]
          return (
            <motion.li
              key={category}
              className="absolute inset-0"
              style={
                {
                  x: offset.x,
                  y: offset.y,
                } as CSSProperties
              }
            >
              <span
                className={clsx(
                  "inline-block -translate-y-1/2 text-center",
                  CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                )}
              >
                {category}
              </span>
            </motion.li>
          )
        })}
      </motion.ul>
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
    <div className="fixed inset-x-2 bottom-2 z-10 grid place-items-center">
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
  const parallaxStyle = useCursorParallax({ amount: 0.3 })

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
      className="relative -mb-[250svh] h-[250svh] overflow-x-clip text-smiley-yellow-400 noscript:mb-0 noscript:h-svh"
    >
      <h1 className="sr-only">Artists Together</h1>
      <motion.div
        className="sticky top-0 grid h-svh place-items-center"
        style={{
          ...style,
          ...parallaxStyle,
        }}
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
  className,
}: PropsWithChildren<{
  debug?: boolean
  position?: "last"
  className?: string
}>) {
  const ref = useRef<ComponentRef<"div">>(null)
  const parallaxStyle = useCursorParallax({ amount: 0.3 })
  const scroll = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  })

  const blur = useTransform(
    scroll.scrollYProgress,
    position === "last" ? [0, 1] : [0, 0.25, 0.5, 0.6, 1],
    {
      filter:
        position === "last"
          ? ["blur(32px)", "blur(0px)"]
          : [
              "blur(32px)",
              "blur(16px)",
              "blur(0px)",
              "blur(0px)",
              "blur(48px)",
            ],
    },
  )

  const style = useTransform(
    scroll.scrollYProgress,
    position === "last" ? [0, 1] : [0, 0.25, 0.5, 0.75, 1],
    position === "last"
      ? {
          opacity: [0, 1],
          scale: [0, 1],
        }
      : {
          opacity: [0, 0.5, 1, 0.5, 0],
          scale: [0, 0.5, 1, 2.5, 5],
        },
  )

  return (
    <motion.div
      ref={ref}
      className={clsx(
        "relative overflow-x-clip noscript:mb-0 noscript:h-svh",
        position === "last" ? "h-[250svh]" : "-mb-[250svh] h-[500svh]",
        className,
      )}
    >
      <motion.div
        className={clsx(
          "sticky top-0 grid h-svh place-items-center",
          "noscript:mb-0 noscript:h-svh noscript:!scale-100 noscript:!opacity-100 noscript:!blur-0",
        )}
        style={{
          ...style,
          ...blur,
          ...parallaxStyle,
        }}
      >
        {children}
      </motion.div>
    </motion.div>
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
          <Scroll className="text-plushie-pink-400">
            Artists Together is a worldwide,
            <br className="sm:hidden" /> inclusive, and diverse
            <br className="hidden sm:block" /> community{" "}
            <br className="sm:hidden" />
            for all kinds of artists and skill levels.
          </Scroll>
          <Scroll className="text-microscopic-green-400">
            We want to give artists <br className="sm:hidden" />
            from around the globe a place to share,
            <br className="hidden sm:block" />
            <br className="sm:hidden" /> learn, and talk with other creative
            folks.
          </Scroll>
          <Scroll className="text-smiley-yellow-400">
            We celebrate creativity, diversity,
            <br /> entertainment, and learning.
          </Scroll>
          <Particles />
          <Scroll className="text-microscopic-green-400">
            So, create, share, and enjoy,
            <br /> because we are glad to have you here.
          </Scroll>
          <Scroll className="text-smiley-yellow-400" position="last">
            Artists, together.
          </Scroll>
        </main>
        <Cursors />
      </Lenis>
    </>
  )
}

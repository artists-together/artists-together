"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react"
import { useEffect, useRef, useState } from "react"
import type { InstancedMesh } from "three"
import { Color, Object3D } from "three"
import { colors } from "../../../tailwind.config"

const COUNT = 500
const XY_BOUNDS = 40
const Z_BOUNDS = 125
const MAX_SPEED_FACTOR = 2
const MAX_SCALE_FACTOR = 50

const themeableColorRegex = /(?:rgb\()(\d+,)\s*(\d+,)\s*(\d+)(?:\))/

function parseColor(color: string) {
  const match = color.match(themeableColorRegex)

  if (!match) {
    throw Error(`Invalid color "${color}"`)
  }

  const [, r, g, b] = match

  return [
    parseInt(String(r)) / 255,
    parseInt(String(g)) / 255,
    parseInt(String(b)) / 255,
  ] as const
}

const COLORS = [
  parseColor(colors["arpeggio-black"][500]),
  parseColor(colors["smiley-yellow"][200]),
  parseColor(colors["microscopic-green"][300]),
]

const tempObject = new Object3D()
const tempColor = new Color()

function Scene() {
  const ref = useRef<InstancedMesh>(null)
  const positions = useRef<Float32Array | null>(null)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (!ref.current) return

    const t = new Object3D()
    const nextPositions = new Float32Array(COUNT * 3)
    let rnd = 0
    for (let i = 0; i < COUNT; i++) {
      const x = (Math.random() - 0.5) * XY_BOUNDS
      const y = (Math.random() - 0.5) * XY_BOUNDS
      const z = (Math.random() - 0.5) * Z_BOUNDS
      const index = i * 3

      nextPositions[index] = x
      nextPositions[index + 1] = y
      nextPositions[index + 2] = z

      t.position.set(x, y, z)
      t.updateMatrix()
      const color = COLORS[rnd]
      if (!color) continue
      tempColor.setRGB(color[0], color[1], color[2])
      rnd = (rnd + 1) % COLORS.length
      ref.current.setMatrixAt(i, t.matrix)
      ref.current.setColorAt(i, tempColor)
    }

    positions.current = nextPositions
    ref.current.instanceMatrix.needsUpdate = true
    if (ref.current.instanceColor) {
      ref.current.instanceColor.needsUpdate = true
    }
  }, [])

  const { scrollYProgress } = useScroll()
  const y = useSpring(scrollYProgress, {
    damping: 50,
    stiffness: 400,
  })

  useFrame((_, delta) => {
    if (!ref.current) return
    if (prefersReducedMotion) return
    const currentPositions = positions.current
    if (!currentPositions) return

    const velocity = Math.abs(y.getVelocity() / 3)

    for (let i = 0; i < COUNT; i++) {
      // update scale
      tempObject.scale.set(0.5, 0.5, Math.max(0.5, velocity * MAX_SCALE_FACTOR))

      // update position
      const index = i * 3
      const x = currentPositions[index]
      const yPos = currentPositions[index + 1]
      let z = currentPositions[index + 2]

      if (z > Z_BOUNDS / 2) {
        const max = -Z_BOUNDS / 2
        z = Math.random() * max
      } else {
        z += Math.max(delta, velocity * MAX_SPEED_FACTOR)
      }

      currentPositions[index + 2] = z

      tempObject.position.set(x, yPos, z)

      // apply transforms
      tempObject.updateMatrix()
      ref.current.setMatrixAt(i, tempObject.matrix)
    }

    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <>
      <instancedMesh
        ref={ref}
        args={[undefined, undefined, COUNT]}
        matrixAutoUpdate
      >
        <sphereGeometry args={[0.05]} />
        <meshBasicMaterial color={[1.5, 1.5, 1.5]} toneMapped={false} />
      </instancedMesh>
    </>
  )
}

export default function Stars() {
  const [loaded, setLoaded] = useState(false)

  return (
    <motion.div
      initial={false}
      animate={{ opacity: loaded ? 1 : 0 }}
      transition={{ duration: 1.75, delay: 0.3 }}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
    >
      <Canvas
        className="absolute inset-0 size-full"
        onCreated={() => setLoaded(true)}
      >
        <Scene />
      </Canvas>
    </motion.div>
  )
}

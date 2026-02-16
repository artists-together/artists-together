"use client"

import { cancelFrame, frame, FrameData } from "motion"
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react"
import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"
import {
  Color,
  InstancedMesh,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  WebGLRenderer,
} from "three"
import { useCursorParallax } from "@/lib/motion"
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
  ]
}

const COLORS = [
  parseColor(colors["plushie-pink"][500]),
  parseColor(colors["smiley-yellow"][500]),
  parseColor(colors["microscopic-green"][500]),
]

const tempObject = new Object3D()
const tempColor = new Color()

function createMesh() {
  const geometry = new SphereGeometry(0.05)
  const material = new MeshBasicMaterial({
    color: new Color(1.5, 1.5, 1.5),
    toneMapped: false,
  })

  return new InstancedMesh(geometry, material, COUNT)
}

function disposeMesh(mesh: InstancedMesh) {
  mesh.geometry.dispose()
  if (Array.isArray(mesh.material)) {
    for (const material of mesh.material) material.dispose()
  } else {
    mesh.material.dispose()
  }
}

export default function StarsVanillaThree() {
  const [loaded, setLoaded] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rendererRef = useRef<WebGLRenderer | null>(null)
  const sceneRef = useRef<Scene | null>(null)
  const cameraRef = useRef<PerspectiveCamera | null>(null)
  const meshRef = useRef<InstancedMesh | null>(null)
  const positionsRef = useRef<Float32Array | null>(null)
  const frameActiveRef = useRef(false)
  const runningRef = useRef(false)
  const lastTimeRef = useRef<number | null>(null)
  const reducedMotion = useReducedMotion()

  const scroll = useScroll()
  const y = useSpring(scroll.scrollYProgress, {
    damping: 50,
    stiffness: 400,
  })

  const renderFrame = useCallback(
    (data: FrameData) => {
      if (!runningRef.current) return
      const renderer = rendererRef.current
      const scene = sceneRef.current
      const camera = cameraRef.current
      const mesh = meshRef.current
      const positions = positionsRef.current

      if (!renderer || !scene || !camera || !mesh || !positions) return

      const time = data.timestamp
      const lastTime = lastTimeRef.current ?? time
      const delta = (time - lastTime) / 1000
      lastTimeRef.current = time

      const velocity = y.getVelocity() / 3
      const previousY = y.getPrevious() ?? 0
      const direction = y.get() > previousY ? 1 : -1
      const step =
        direction * Math.max(delta, Math.abs(velocity) * MAX_SPEED_FACTOR)

      for (let i = 0; i < COUNT; i++) {
        tempObject.scale.set(
          0.75,
          0.75,
          Math.max(0.75, velocity * MAX_SCALE_FACTOR),
        )

        const index = i * 3
        const x = positions[index]
        const yPos = positions[index + 1]
        let z = positions[index + 2]

        z += step

        if (z > Z_BOUNDS / 2) {
          z = -Z_BOUNDS / 2
        }

        if (z < -Z_BOUNDS / 2) {
          z = Z_BOUNDS / 2
        }

        positions[index + 2] = z

        tempObject.position.set(x, yPos, z)
        tempObject.updateMatrix()
        mesh.setMatrixAt(i, tempObject.matrix)
      }

      mesh.instanceMatrix.needsUpdate = true
      renderer.render(scene, camera)
    },
    [y],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    })

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)

    const scene = new Scene()
    const camera = new PerspectiveCamera(75, 1, 0.1, 200)
    camera.position.z = 50

    const mesh = createMesh()
    scene.add(mesh)

    const positions = new Float32Array(COUNT * 3)
    const seedObject = new Object3D()
    let rnd = 0
    for (let i = 0; i < COUNT; i++) {
      const x = (Math.random() - 0.5) * XY_BOUNDS
      const yPos = (Math.random() - 0.5) * XY_BOUNDS
      const z = (Math.random() - 0.5) * Z_BOUNDS
      const index = i * 3

      positions[index] = x
      positions[index + 1] = yPos
      positions[index + 2] = z

      seedObject.position.set(x, yPos, z)
      seedObject.scale.set(0.5, 0.5, 0.5)
      seedObject.updateMatrix()

      const color = COLORS[rnd]
      tempColor.setRGB(color[0], color[1], color[2])
      rnd = (rnd + 1) % COLORS.length

      mesh.setMatrixAt(i, seedObject.matrix)
      mesh.setColorAt(i, tempColor)
    }

    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true
    }

    const resize = () => {
      const { clientWidth, clientHeight } = canvas
      if (clientWidth === 0 || clientHeight === 0) return
      camera.aspect = clientWidth / clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(clientWidth, clientHeight, false)
      renderer.render(scene, camera)
    }

    rendererRef.current = renderer
    sceneRef.current = scene
    cameraRef.current = camera
    meshRef.current = mesh
    positionsRef.current = positions

    resize()
    startTransition(() => setLoaded(true))

    window.addEventListener("resize", resize)

    return () => {
      window.removeEventListener("resize", resize)
      cancelFrame(renderFrame)
      runningRef.current = false
      lastTimeRef.current = null
      disposeMesh(mesh)
      renderer.dispose()
      rendererRef.current = null
      sceneRef.current = null
      cameraRef.current = null
      meshRef.current = null
      positionsRef.current = null
    }
  }, [renderFrame])

  useEffect(() => {
    const renderer = rendererRef.current
    const scene = sceneRef.current
    const camera = cameraRef.current
    if (!loaded || !renderer || !scene || !camera) return

    if (reducedMotion) {
      runningRef.current = false
      if (frameActiveRef.current) {
        cancelFrame(renderFrame)
        frameActiveRef.current = false
      }
      lastTimeRef.current = null
      renderer.render(scene, camera)
      return
    }

    if (!runningRef.current) {
      runningRef.current = true
      if (!frameActiveRef.current) {
        frameActiveRef.current = true
        frame.update(renderFrame, true)
      }
    }

    return () => {
      runningRef.current = false
      if (frameActiveRef.current) {
        cancelFrame(renderFrame)
        frameActiveRef.current = false
      }
      lastTimeRef.current = null
    }
  }, [loaded, reducedMotion, renderFrame])

  const parallaxStyle = useCursorParallax({ amount: 0.7 })

  return (
    <motion.div
      initial={false}
      animate={{ opacity: loaded ? 1 : 0 }}
      transition={{ duration: 1.75, delay: 0.3 }}
      aria-hidden
      className="pointer-events-none fixed inset-0"
      style={parallaxStyle}
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </motion.div>
  )
}

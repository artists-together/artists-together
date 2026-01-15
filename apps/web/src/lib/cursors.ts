import { Room } from "@artists-together/core/ws"
import { atom, computed } from "nanostores"
import { ensure } from "./utils"

export const DATA_ATTR_SCOPE = "data-scope"

/**
 * An atom representing the currently active cursor scopes.
 */
export const atomScopes = atom<string[]>([])

/**
 * An atom representing the latest active cursor scope.
 */
export const atomScope = computed(atomScopes, (scopes) => {
  const scope = scopes[scopes.length - 1]
  return scope ? scope : null
})

/**
 * An atom representing the state of the cursor room.
 */
export const atomRoom = atom<Room>({})

export const measurements = new Map<string | HTMLElement, DOMRectReadOnly>()

export function measureScope(scope: string | null | undefined) {
  return ensure(measurements, {
    key: scope || document.documentElement,
    set: () => {
      if (!scope) {
        return document.documentElement.getBoundingClientRect()
      }

      const element = document.querySelector(`[${DATA_ATTR_SCOPE}]`)
      if (!element) {
        throw Error(`Unable to select element with scope: ${scope}`)
      }

      return element.getBoundingClientRect()
    },
  })
}

export type Point2D = [number, number]

export function dist(a: Point2D, b: Point2D): number {
  return Math.hypot(a[1] - b[1], a[0] - b[0])
}

export class Spline {
  points: Point2D[] = []

  lengths: number[] = []

  totalLength = 0

  private prev?: Point2D

  constructor(points: Point2D[] = []) {
    this.points = points
    this.lengths = points.map((point, i, arr) =>
      i === 0 ? 0 : dist(point, arr[i - 1]),
    )
    this.totalLength = this.lengths.reduce((acc, cur) => acc + cur, 0)
  }

  addPoint = (point: Point2D) => {
    if (this.prev) {
      const length = dist(this.prev, point)
      this.lengths.push(length)
      this.totalLength += length
      this.points.push(point)
    }
    this.prev = point
  }

  clear = () => {
    this.points = this.prev ? [this.prev] : []
    this.totalLength = 0
  }

  getSplinePoint = (rt: number): Point2D => {
    const { points } = this
    const l = points.length - 1,
      d = Math.trunc(rt),
      p1 = Math.min(d + 1, l),
      p2 = Math.min(p1 + 1, l),
      p3 = Math.min(p2 + 1, l),
      p0 = p1 - 1,
      t = rt - d
    const tt = t * t,
      ttt = tt * t,
      q1 = -ttt + 2 * tt - t,
      q2 = 3 * ttt - 5 * tt + 2,
      q3 = -3 * ttt + 4 * tt + t,
      q4 = ttt - tt
    const [p0x, p0y] = points[p0],
      [p1x, p1y] = points[p1],
      [p2x, p2y] = points[p2],
      [p3x, p3y] = points[p3]
    return [
      (p0x * q1 + p1x * q2 + p2x * q3 + p3x * q4) / 2,
      (p0y * q1 + p1y * q2 + p2y * q3 + p3y * q4) / 2,
    ]
  }
}

type AnimationState = "stopped" | "idle" | "animating"

type Animation = {
  from: Point2D
  to: Point2D
  start: number
  duration: number
}

// Modified from https://github.com/steveruizok/perfect-cursors
export class PerfectCursor {
  state: AnimationState = "idle"
  queue: Animation[] = []
  timestamp = performance.now()
  lastRequestId = 0
  timeoutId: ReturnType<typeof setTimeout> | null = null
  prevPoint?: Point2D
  spline = new Spline()
  cb: (point: Point2D) => void

  constructor(cb: (point: Point2D) => void) {
    this.cb = cb
  }

  addPoint = (point: Point2D) => {
    if (this.timeoutId) clearTimeout(this.timeoutId)
    const now = performance.now()
    const duration = Math.min(now - this.timestamp, PerfectCursor.MAX_INTERVAL)
    if (!this.prevPoint) {
      this.spline.clear()
      this.prevPoint = point
      this.spline.addPoint(point)
      this.cb(point)
      this.state = "stopped"
      return
    }
    if (this.state === "stopped") {
      if (dist(this.prevPoint, point) < 4) {
        this.cb(point)
        return
      }
      this.spline.clear()
      this.spline.addPoint(this.prevPoint)
      this.spline.addPoint(this.prevPoint)
      this.spline.addPoint(point)
      this.state = "idle"
    } else {
      this.spline.addPoint(point)
    }
    if (duration < 16) {
      this.prevPoint = point
      this.timestamp = now
      this.cb(point)
      return
    }
    const animation: Animation = {
      start: this.spline.points.length - 3,
      from: this.prevPoint,
      to: point,
      duration,
    }
    this.prevPoint = point
    this.timestamp = now
    switch (this.state) {
      case "idle": {
        this.state = "animating"
        this.animateNext(animation)
        break
      }
      case "animating": {
        this.queue.push(animation)
        break
      }
    }
  }

  animateNext = (animation: Animation) => {
    const start = performance.now()
    const loop = () => {
      const t = (performance.now() - start) / animation.duration
      if (t <= 1 && this.spline.points.length > 0) {
        try {
          this.cb(this.spline.getSplinePoint(t + animation.start))
        } catch (e) {
          console.warn(e)
        }
        this.lastRequestId = requestAnimationFrame(loop)
        return
      }
      const next = this.queue.shift()
      if (next) {
        this.state = "animating"
        this.animateNext(next)
      } else {
        this.state = "idle"
        this.timeoutId = setTimeout(() => {
          this.state = "stopped"
        }, PerfectCursor.MAX_INTERVAL)
      }
    }
    loop()
  }

  static MAX_INTERVAL = 300

  // TODO: New addition - must be tested
  reset = () => {
    this.queue = []
    this.prevPoint = undefined
    this.state = "idle"
    this.spline.clear()
    if (this.lastRequestId) {
      cancelAnimationFrame(this.lastRequestId)
      this.lastRequestId = 0
    }
  }

  dispose = () => {
    if (this.timeoutId) clearTimeout(this.timeoutId)
  }
}

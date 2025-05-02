/**
 * Randomly selects and returns one element from the provided array.
 */
export function draw<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)]!
}

/**
 * An empty function.
 */
export function noop() {
  return () => {}
}

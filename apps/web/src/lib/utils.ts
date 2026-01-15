export function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length
  let randomIndex

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    // And swap it with the current element.
    ;[array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ]
  }

  return array
}

export type EnsureOptions<K, V> = {
  key: K
  set: (key: K) => V
}

export function ensure<K, V>(
  map: Map<K, V>,
  { key, set }: EnsureOptions<K, V>,
): V

export function ensure<K extends WeakKey, V>(
  weakMap: WeakMap<K, V>,
  { key, set }: EnsureOptions<K, V>,
): V

export function ensure(
  map: Map<unknown, unknown> | WeakMap<WeakKey, unknown>,
  { key, set }: EnsureOptions<any, unknown>,
) {
  return map.has(key) ? map.get(key) : map.set(key, set(key)).get(key)
}

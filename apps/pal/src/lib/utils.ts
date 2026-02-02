export function ensure<K, V, T extends (key: K) => V | Promise<V>>(
  map: Pick<Map<K, V>, "has" | "get" | "set">,
  {
    key,
    set,
  }: {
    key: K
    set: T
  },
): ReturnType<T> {
  if (map.has(key)) {
    return map.get(key) as any
  }

  const value = set(key)
  if (value instanceof Promise) {
    return value.then((value) => map.set(key, value).get(key)) as any
  }

  return map.set(key, value).get(key) as any
}

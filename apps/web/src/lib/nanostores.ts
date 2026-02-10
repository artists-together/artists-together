import type { Store } from "nanostores"
import { useCallback, useSyncExternalStore } from "react"

export function useStore<T>(store: Store<T>) {
  const subscribe = useCallback(
    (notify: VoidFunction) => store.listen(notify),
    [store],
  )
  return useSyncExternalStore<T>(subscribe, store.get, store.get)
}

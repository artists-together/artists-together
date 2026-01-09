import { useCallback, useSyncExternalStore } from "react"
import type { ScreensConfig } from "tailwindcss/types/config"
import { screens } from "../../tailwind.config"

export type Screen = keyof typeof screens

function resolveTailwindScreen(screen: Screen) {
  const config = screens[screen] as string | ScreensConfig

  if (typeof config === "string") {
    return `(min-width: ${config})`
  }

  if ("min" in config && "max" in config) {
    return `(min-width: ${config.min} and max-width: ${config.max})`
  }

  if ("max" in config) {
    return `(max-width: ${config.max})`
  }

  if ("raw" in config && typeof config.raw === "string") {
    return config.raw
  }

  throw Error(`Unhandled screen: ${screen}`)
}

export function onMediaQuery(
  query: string,
  callback: (event: MediaQueryListEvent) => void,
) {
  const mediaQueryList = matchMedia(query)

  mediaQueryList.addEventListener("change", callback, {
    passive: true,
  })

  return function unsubscribe() {
    mediaQueryList.removeEventListener("change", callback)
  }
}

export function useMediaQuery(query: string) {
  const subscription = useCallback(
    (callback: VoidFunction) => onMediaQuery(query, callback),
    [query],
  )

  return useSyncExternalStore(
    subscription,
    () => window.matchMedia(query).matches,
    () => null,
  )
}

export function onScreen(
  screen: Screen,
  callback: (event: MediaQueryListEvent) => void,
) {
  return onMediaQuery(resolveTailwindScreen(screen), callback)
}

export function useScreen(screen: Screen) {
  return useMediaQuery(resolveTailwindScreen(screen))
}

"use client"

import { resize } from "motion"
import {
  ComponentProps,
  createContext,
  RefCallback,
  use,
  useCallback,
} from "react"
import { mergeRefs } from "react-merge-refs"
import { atomScopes, DATA_ATTR_SCOPE, measurements } from "@/lib/cursors"

type Props = ComponentProps<"div"> & {
  scope: string
  as?: string
}

const ScopeContext = createContext<string | null>(null)

export default function CursorScope({
  as: Tag = "div",
  scope,
  ...props
}: Props) {
  const parentScope = use(ScopeContext)
  const mergedScope = parentScope ? `${parentScope}:${scope}` : scope

  const scopeProps = {
    [DATA_ATTR_SCOPE]: mergedScope,
  }

  const refMeasure = useCallback<RefCallback<HTMLElement>>(
    (element) => {
      if (!element) return
      return resize(element, () => {
        measurements.delete(mergedScope)
      })
    },
    [mergedScope],
  )

  const refHover = useCallback<RefCallback<HTMLElement>>(
    (element) => {
      if (!element) return
      const abortController = new AbortController()

      element.addEventListener(
        "mouseenter",
        () => {
          atomScopes.set([...atomScopes.get(), mergedScope])
        },
        { signal: abortController.signal },
      )

      element.addEventListener(
        "mouseleave",
        () => {
          atomScopes.set(
            atomScopes.get().filter((scope) => scope !== mergedScope),
          )
        },
        { signal: abortController.signal },
      )

      return () => abortController.abort()
    },
    [mergedScope],
  )

  return (
    <ScopeContext value={mergedScope}>
      <Tag
        ref={mergeRefs([props.ref, refMeasure, refHover])}
        {...scopeProps}
        {...props}
      />
    </ScopeContext>
  )
}

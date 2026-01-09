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
import { DATA_ATTR_SCOPE, measurements, ROOT_SCOPE } from "@/lib/cursors"

type Props = ComponentProps<"div"> & {
  scope: string
  as?: string
}

const ScopeContext = createContext<string>(ROOT_SCOPE)

export default function CursorScope({
  as: Tag = "div",
  scope,
  ...props
}: Props) {
  const parentScope = use(ScopeContext)
  const mergedScope = `${parentScope}:${scope}`

  const scopeProps = {
    [DATA_ATTR_SCOPE]: mergedScope,
  }

  const refMeasure = useCallback<RefCallback<Element>>(
    (element) => {
      if (element) {
        return resize(element, () => {
          console.log("Removing measurement", mergedScope)
          measurements.delete(mergedScope)
        })
      }
    },
    [mergedScope],
  )

  return (
    <ScopeContext value={mergedScope}>
      <Tag
        ref={mergeRefs([props.ref, refMeasure])}
        {...scopeProps}
        {...props}
      />
    </ScopeContext>
  )
}

export const DATA_ATTR_SCOPE = "data-scope"

export const ROOT_SCOPE = "root"

export const measurements = new Map<string, DOMRectReadOnly>()

export function measure(scope: string, element: Element) {
  return measurements.has(scope)
    ? measurements.get(scope)!
    : measurements.set(scope, element.getBoundingClientRect()).get(scope)!
}

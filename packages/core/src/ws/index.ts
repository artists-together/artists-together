import * as v from "valibot"

/**
 * A cursor position.
 * ```ts
 * ["root", null]         // Hidden
 * ["root", 13, 12]      // 15% left, 12% top from root
 * ["root:logo", 13, 12] // 15% left, 12% top from root:logo
 * ```
 */
export const Position = v.tuple([v.string(), v.number(), v.number()])

export type Position = v.InferInput<typeof Position>

export const NullablePosition = v.nullable(Position)

export type NullablePosition = v.InferInput<typeof NullablePosition>

export const NullablePositionWithDelta = v.tuple([v.number(), NullablePosition])

export type NullablePositionWithDelta = v.InferInput<
  typeof NullablePositionWithDelta
>

/**
 * A collection of cursor positions.
 *
 * @example
 * ```ts
 * [
 *   ["eafa5d32-5042-4e8c-89b9-e67ff463e16e", [13, 12]], // with position
 *   ["77e97875-53ae-4ed1-a418-73a66c965c9f", null] // without position
 * ]
 * ```
 */
export const Room = v.array(v.tuple([v.string(), NullablePosition]))

export type Room = v.InferInput<typeof Room>

const messages = {
  client: {
    disconnect: v.tuple([v.literal("disconnect")]),
    connect: v.tuple([v.literal("connect"), NullablePositionWithDelta]),
    update: v.tuple([v.literal("update"), NullablePositionWithDelta]),
  },
  server: {
    update: v.tuple([v.literal("update"), Room]),
  },
}

type Messages = typeof messages

// type Message<
//   Environment extends keyof Messages,
//   Event extends keyof Messages[Environment],
// > = v.InferInput<Messages[Environment][Event]>

export function parser<
  Environment extends keyof Messages,
  Event extends keyof Messages[Environment],
>(environment: Environment, event: Event) {
  const schema = messages[environment][event]
  return v.safeParser(v.pipe(v.string(), v.parseJson(), schema))
}

const e = parser("client", "connect")("")

// export function createStringify<
// >(environment: Environment, event: Event) {

// }

// export function createParser(string: String) {}

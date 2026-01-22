import * as v from "valibot"

function serde<
  TInput,
  TOutput,
  TIssue extends v.BaseIssue<unknown>,
  Schema extends v.BaseSchema<TInput, TOutput, TIssue>,
>(schema: Schema) {
  const serde = {
    serialize: (input: v.InferInput<Schema>) => JSON.stringify(input),
    deserialize: v.safeParser(v.pipe(v.string(), v.parseJson(), schema)),
  }

  return serde as typeof serde & {
    "~input": v.InferInput<Schema>
    "~output": v.InferOutput<Schema>
  }
}

export const CursorPosition = v.nullable(
  v.tuple([
    v.pipe(v.number(), v.minValue(0), v.maxValue(100)),
    v.pipe(v.number(), v.minValue(0), v.maxValue(100)),
  ]),
)

export type CursorPosition = v.InferInput<typeof CursorPosition>

export const CursorPositionWithDelta = v.tuple([
  v.pipe(v.number(), v.minValue(0), v.maxValue(3600000)),
  CursorPosition,
])

export type CursorPositionWithDelta = v.InferInput<
  typeof CursorPositionWithDelta
>

export const CursorPositions = v.array(CursorPositionWithDelta)

export type CursorPositions = v.InferInput<typeof CursorPositions>

/**
 * The state of the room
 * ```ts
 * {
 *   "7888c203-09fb-4e37-b9ff-48f21b468fbd": [13, 12], // 13%, 12% from viewport
 *   "a749173e-5fe9-4889-946e-07607fea4ced": null, // not visible
 * }
 */
export const Room = v.record(v.pipe(v.string(), v.uuid()), CursorPosition)

export type Room = v.InferInput<typeof Room>

export const messages = {
  /**
   * Events send from the server to the client
   */
  server: {
    handshake: serde(v.tuple([v.literal("handshake"), Room])),
    disconnect: serde(
      v.tuple([v.literal("disconnect"), v.pipe(v.string(), v.uuid())]),
    ),
    update: serde(
      v.tuple([
        v.literal("update"),
        v.tuple([v.pipe(v.string(), v.uuid()), CursorPositions]),
      ]),
    ),
  },
  /**
   * Events send from the client to the server
   */
  client: {
    update: serde(v.tuple([v.literal("update"), CursorPositions])),
  },
}

export type Messages = typeof messages

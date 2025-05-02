import { sql } from "drizzle-orm"
import { integer } from "drizzle-orm/sqlite-core"

export const timestamps = {
  createdAt: integer({ mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer({ mode: "timestamp" })
    .notNull()
    .$onUpdate(() => new Date()), // https://github.com/drizzle-team/drizzle-orm/issues/2323
}

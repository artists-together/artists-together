import { Resource } from "sst"
import { drizzle } from "drizzle-orm/libsql"
import * as schema from "./schema"

export * from "drizzle-orm/libsql/migrator"
export * from "drizzle-orm"

export const database = drizzle({
  schema,
  casing: "snake_case",
  connection: {
    url: Resource.Database.url,
    authToken: Resource.Database.token,
    fetch: globalThis.fetch,
  },
})

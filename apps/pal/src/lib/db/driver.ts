import { drizzle } from "drizzle-orm/libsql"
import * as schema from "./schema.ts"

export function connectDatabase() {
  return drizzle({
    connection: {
      url: String(process.env.DATABASE_URL),
      authToken: String(process.env.DATABASE_AUTH_TOKEN),
    },
    casing: "snake_case",
    schema,
  })
}

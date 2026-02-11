import { drizzle } from "drizzle-orm/better-sqlite3"
import * as schema from "./schema.ts"

export function connectDatabase() {
  return drizzle(String(process.env.DATABASE_URL), {
    casing: "snake_case",
    schema,
  })
}

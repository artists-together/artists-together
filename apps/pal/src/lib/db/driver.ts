import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"
import * as schema from "./schema.ts"

const client = createClient({
  url: String(process.env.DATABASE_URL),
  authToken: String(process.env.DATABASE_AUTH_TOKEN),
})

export const database = drizzle({
  casing: "snake_case",
  client,
  schema,
})

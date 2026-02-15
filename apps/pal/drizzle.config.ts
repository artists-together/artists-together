import "dotenv/config"
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  dialect: "turso",
  schema: "./src/lib/db/schema.ts",
  casing: "snake_case",
  dbCredentials: {
    url: String(process.env.DATABASE_URL),
    authToken: String(process.env.DATABASE_AUTH_TOKEN),
  },
})

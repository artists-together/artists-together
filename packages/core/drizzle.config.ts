import { Resource } from "sst"
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./src/database/schema.ts",
  out: "./migrations",
  dialect: "turso",
  dbCredentials: {
    url: Resource.Database.url,
    authToken: Resource.Database.token,
  },
})

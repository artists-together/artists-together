import { seed } from "drizzle-seed"
import { database } from "@/database/client"
import * as schema from "@/database/schema"

console.log("🌱 Seeding database…")

await seed(database, schema)

console.log("✅ Seeded database")

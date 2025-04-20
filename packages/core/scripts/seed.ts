import { seed } from "drizzle-seed"
import { database } from "@/database/client"
import * as schema from "@/database/schema"

await seed(database, schema)

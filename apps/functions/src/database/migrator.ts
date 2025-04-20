import { database } from "@artists-together/core/database/client"
import type { Handler } from "aws-lambda"
import { migrate } from "drizzle-orm/libsql/migrator"

export const handler: Handler = async () => {
  await migrate(database, {
    migrationsFolder: "../../../../packages/core/migrations",
  })
}

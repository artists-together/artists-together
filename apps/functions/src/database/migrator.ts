import { database, migrate } from "@artists-together/core/database/client"
import type { Handler } from "aws-lambda"

export const handler: Handler = async () => {
  await migrate(database, {
    migrationsFolder: "../../../../packages/core/migrations",
  })
}

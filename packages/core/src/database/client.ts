import { Resource } from "sst"
import { drizzle } from "drizzle-orm/libsql/web"

export const database = drizzle({
  casing: "snake_case",
  connection: {
    url: Resource.Database.url,
    authToken: Resource.Database.token,
  },
})

import { Resource } from "sst"
import { drizzle } from "drizzle-orm/libsql"

export const database = drizzle({
  connection: {
    url: Resource.Database.url,
    authToken: Resource.Database.token,
  },
})

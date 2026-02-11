import "dotenv/config"
import "./features/admin.ts"
import "./features/friend-role.ts"
import "./features/inactive-users.ts"
import "./features/live-users.ts"
import { client } from "./lib/client.ts"

client.once("clientReady", () =>
  console.log(`[info] logged in as ${client.user?.tag}`),
)

await client.login(process.env.DISCORD_BOT_TOKEN)

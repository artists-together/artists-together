import { client } from "./lib/client.ts"
import "./features/admin.ts"
import "./features/friend-role.ts"
import "./features/live-users.ts"

client.once("clientReady", () =>
  console.log(`[info] logged in as ${client.user?.tag}`),
)

await client.login(process.env.DISCORD_BOT_TOKEN)

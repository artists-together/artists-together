import { Client, Partials, GatewayIntentBits } from "discord.js"

export const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.Guilds,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
})

client.once("ready", () =>
  console.log(`[info] logged in as ${client.user?.tag}`),
)

await client.login(process.env.DISCORD_BOT_TOKEN)

import { Client, Partials, GatewayIntentBits } from "discord.js"
import { ensure } from "./utils.js"

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
client.guilds.cache

export const guild = await ensure(client.guilds.cache, {
  key: String(process.env.DISCORD_SERVER_ID),
  set: async (key) => client.guilds.fetch(key),
})

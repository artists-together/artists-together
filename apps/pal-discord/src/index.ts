import { Resource } from "sst"
import { Client, Partials, GatewayIntentBits } from "discord.js"
import admin from "./services/admin"
import friendRole from "./services/friend-role"

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

client.once("ready", async (client) => {
  const guild = client.guilds.cache.get(Resource.DiscordServerId.value)

  if (!guild) {
    throw Error("Could not find guild. Did you invite PAL to your guild?")
  }

  await Promise.all([admin(client), friendRole(client)])

  console.log("🚀 Pal is up and running!")
  console.log(` - Name:  ${client.user.tag}`)
  console.log(` - Guild: ${guild.name}`)
  console.log(` - Stage: ${Resource.App.stage}`)
  console.log("")
})

await client.login(Resource.DiscordBotSecret.value)

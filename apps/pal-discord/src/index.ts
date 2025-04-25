import { Resource } from "sst"
import { Client, Partials, GatewayIntentBits } from "discord.js"
import { readdirSync } from "fs"

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

  const services = readdirSync("./src/services/")

  await Promise.all(
    services.map(async (service) => {
      const module = await import("./services/" + service)
      if ("default" in module && typeof module.default === "function") {
        module.default(client)
      }
    }),
  )

  console.log("🚀 Pal is up and running!")
  console.log(` - Name:  ${client.user.tag}`)
  console.log(` - Guild: ${guild.name}`)
  console.log(` - Stage: ${Resource.App.stage}`)
  console.log("")
})

await client.login(Resource.DiscordBotSecret.value)

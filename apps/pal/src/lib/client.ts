import { Client, Partials, GatewayIntentBits } from "discord.js"
import { ensure } from "./utils.ts"

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

export function getGuild() {
  return ensure(client.guilds.cache, {
    key: String(process.env.DISCORD_SERVER_ID),
    set: async (key) => client.guilds.fetch(key),
  })
}

export async function getRole(id: string) {
  const guild = await getGuild()
  return ensure(guild.roles.cache, {
    key: id,
    set: async () => {
      const role = await guild.roles.fetch(id)
      if (!role) throw Error(`Unable to fetch role ${id}`)
      return role
    },
  })
}

export async function getChannel(id: string) {
  const guild = await getGuild()
  return ensure(guild.channels.cache, {
    key: id,
    set: async () => {
      const channel = await guild.channels.fetch(id)
      if (!channel) throw Error(`Unable to fetch channel ${id}`)
      return channel
    },
  })
}

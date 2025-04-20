import { discord } from "@artists-together/core/discord/client"
import type { Handler } from "aws-lambda"
import { Resource } from "sst"

export const handler: Handler = async () => {
  const members = await discord.guilds.getMembers(
    Resource.DiscordServerId.value,
    {
      limit: 1000,
    }
  )

  console.log("kick members: guild member size", members.length)
}

import { discord } from "@artists-together/core/discord/client"
import { CHANNEL } from "@artists-together/core/discord/constants"
import type { Handler } from "aws-lambda"

export const handler: Handler = async () => {
  await discord.channels.createMessage(CHANNEL.BOT_SHENANIGANS, {
    content: Date.now().toString(),
  })
}

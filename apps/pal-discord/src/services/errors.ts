import { getChannel } from "@/lib/utils"
import { ROLE } from "@artists-together/core/discord/constants"
import { choose } from "@artists-together/core/lib/utils"
import { EmbedBuilder, type Client } from "discord.js"

const MESSAGE_TITLE = [
  "Oopsie!",
  "Yikes!",
  "Uh-oh!",
  "Darn it!",
  "Well, this is awkward!",
  "Oh snap!",
]

const MESSAGE_SUBTITLE = [
  "Something went wrong…",
  "I stumbled upon an issue…",
  "I hit a little snag…",
  "Something's not quite right…",
  "I goofed up…",
  "A hiccup in the system…",
]

export async function reportError(client: Client<true>, error: Error) {
  const channel = await getChannel(client, "BOT_SHENANIGANS")

  if (!channel.isSendable()) {
    throw Error(`Channel "${channel.name || channel.id}" is not sendable`, {
      cause: channel,
    })
  }

  await channel.send({
    content:
      `<@&${ROLE.TECH_SUPPORT}>` +
      " " +
      choose(MESSAGE_TITLE) +
      " " +
      choose(MESSAGE_SUBTITLE),
    embeds: [
      new EmbedBuilder({
        color: 0xff1800,
        fields: [
          {
            name: "Name",
            value: `\`${error.name}\``,
            inline: false,
          },
          {
            name: "Message",
            value: `\`${error.message}\``,
            inline: false,
          },
          {
            name: "Cause",
            value: error.cause
              ? `\`\`\`${error.cause}\`\`\``
              : "No error cause found",
            inline: false,
          },
          {
            name: "Stack trace",
            value: error.stack
              ? `\`\`\`${error.stack}\`\`\``
              : "No error stack trace found",
            inline: false,
          },
        ],
      }),
    ],
  })
}

export default async (client: Client<true>) => {
  process.on("uncaughtException", async (error) => {
    await reportError(client, error)
  })
}

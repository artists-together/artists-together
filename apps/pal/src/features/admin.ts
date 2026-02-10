import {
  ActivityType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js"
import { client, getRole } from "../lib/client.ts"
import { ROLE } from "../lib/constants.ts"

const COMMAND = {
  SEND: {
    MESSAGE: "message",
  },
  STATUS: {
    SET: "set",
    REMOVE: "remove",
  },
}

export const command = new SlashCommandBuilder()
  .setName("admin")
  .setDescription("Admin commands")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addSubcommandGroup((group) =>
    group
      .setName("send")
      .setDescription("Makes PAL send something in the current channel")
      .addSubcommand((subcommand) =>
        subcommand
          .setName(COMMAND.SEND.MESSAGE)
          .setDescription("Send a text message as PAL in the current channel")
          .addStringOption((option) =>
            option.setName("message").setDescription("Message to send"),
          )
          .addAttachmentOption((option) =>
            option.setName("attachment").setDescription("Optional attatchment"),
          ),
      ),
  )
  .addSubcommandGroup((group) =>
    group
      .setName("status")
      .setDescription("Status-related commands")
      .addSubcommand((subcommand) =>
        subcommand
          .setName(COMMAND.STATUS.SET)
          .setDescription("Sets a new status for PAL")
          .addStringOption((option) =>
            option.setName("status").setDescription("Status").setRequired(true),
          ),
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName(COMMAND.STATUS.REMOVE)
          .setDescription("Removes PAL status"),
      ),
  )

async function parseMentions(text: string) {
  if (!text) return text
  if (!text.includes("@")) return text

  const mentionEntries = await Promise.all(
    Object.entries(ROLE).map(async ([name, id]) => {
      const role = await getRole(id)
      return [`@${name}`, role.toString()] as const
    }),
  )

  const mentionMap = Object.fromEntries(mentionEntries)

  return text.replace(/@[A-Z_]+/g, (match) => mentionMap[match] ?? match)
}

async function handleSendMessage(interaction: ChatInputCommandInteraction) {
  const message = interaction.options.getString("message")
  const attachment = interaction.options.getAttachment("attachment")

  if (!interaction.guild) {
    throw Error("Expected guild property in interaction")
  }

  if (!interaction.channel) {
    throw Error("Expected channel property in interaction")
  }

  if (!interaction.channel.isSendable()) {
    return interaction.reply({
      ephemeral: true,
      content: "I cannot send that here!",
    })
  }

  if (!message && !attachment) {
    return interaction.reply({
      ephemeral: true,
      content: "I cannot send an empty message!",
    })
  }

  try {
    const parsedMessage = await parseMentions(message ?? "")

    await interaction.channel.send({
      content: parsedMessage,
      files: attachment ? [attachment.url] : [],
    })

    return interaction.reply({
      content: "All set!",
      ephemeral: true,
    })
  } catch (error) {
    console.error("[admin] send message:", error)
    return interaction.reply({
      content: "Oops! Something went wrong…",
      ephemeral: true,
    })
  }
}

async function handleStatusSet(interaction: ChatInputCommandInteraction) {
  const status = interaction.options.getString("status", true)
  try {
    interaction.client.user.presence.set({
      activities: [
        {
          type: ActivityType.Custom,
          name: status,
        },
      ],
    })

    return interaction.reply({
      content: "All set!",
      ephemeral: true,
    })
  } catch (error) {
    console.error("[admin] status set:", error)
    return interaction.reply({
      content: "Oops! Something went wrong…",
      ephemeral: true,
    })
  }
}

async function handleStatusRemove(interaction: ChatInputCommandInteraction) {
  try {
    interaction.client.user.presence.set({
      activities: [],
    })
    return interaction.reply({
      content: "All set!",
      ephemeral: true,
    })
  } catch (error) {
    console.error("[admin] status remove:", error)
    return interaction.reply({
      content: "Oops! Something went wrong…",
      ephemeral: true,
    })
  }
}

client.on("interactionCreate", (interaction) => {
  if (interaction.isChatInputCommand()) {
    switch (interaction.options.getSubcommand()) {
      case COMMAND.SEND.MESSAGE:
        return handleSendMessage(interaction)
      case COMMAND.STATUS.SET:
        return handleStatusSet(interaction)
      case COMMAND.STATUS.REMOVE:
        return handleStatusRemove(interaction)
    }
  }
})

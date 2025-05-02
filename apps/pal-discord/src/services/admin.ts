import { kv } from "@artists-together/core/kv/client"
import { attemptAsync } from "@artists-together/core/lib/attempt"
import { createExponetialDelay, retryAsyncDecorator } from "ts-retry"
import {
  ActivityType,
  ChatInputCommandInteraction,
  Client,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js"

export const builder = new SlashCommandBuilder()
  .setName("admin")
  .setDescription("Admin-only commands")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addSubcommand((subcommand) =>
    subcommand
      .setName("extinguish")
      .setDescription("Removes all messages from ART emergencies"),
  )
  .addSubcommandGroup((group) =>
    group
      .setName("send")
      .setDescription("Makes PAL send something in the current channel")
      .addSubcommand((subcommand) =>
        subcommand
          .setName("message")
          .setDescription("Send a text message as PAL in the current channel")
          .addStringOption((option) =>
            option.setName("message").setDescription("Message to send"),
          )
          .addAttachmentOption((option) =>
            option.setName("attachment").setDescription("Optional attatchment"),
          ),
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("embed")
          .setDescription("Send an embed as PAL in the current channel"),
      ),
  )
  .addSubcommandGroup((group) =>
    group
      .setName("status")
      .setDescription("Status-related commands")
      .addSubcommand((subcommand) =>
        subcommand
          .setName("set")
          .setDescription("Sets a new status for PAL")
          .addStringOption((option) =>
            option.setName("status").setDescription("Status").setRequired(true),
          ),
      )
      .addSubcommand((subcommand) =>
        subcommand.setName("remove").setDescription("Removes PAL status"),
      ),
  )

async function bootstrapClientStatus(client: Client<true>) {
  const result = await attemptAsync(
    retryAsyncDecorator(async () => kv.getItem<string>("pal-discord-status"), {
      delay: createExponetialDelay(0),
      maxTry: 5,
    }),
  )

  if (!result.success) return
  if (!result.data) return

  client.user.setPresence({
    activities: [
      {
        type: ActivityType.Custom,
        name: result.data,
      },
    ],
  })
}

async function subcommandStatusSet(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({
    flags: MessageFlags.Ephemeral,
  })

  const status = interaction.options.getString("status", true)

  const result = await attemptAsync(
    retryAsyncDecorator(
      async () => kv.setItem<string>("pal-discord-status", status),
      {
        delay: createExponetialDelay(0),
        maxTry: 5,
      },
    ),
  )

  if (!result.success) {
    await interaction.editReply({
      content: "Oops!",
    })
  }

  interaction.client.user.setPresence({
    activities: [
      {
        type: ActivityType.Custom,
        name: status,
      },
    ],
  })

  await interaction.editReply({
    content: "✅",
  })
}

async function subcommandStatusRemove(
  interaction: ChatInputCommandInteraction,
) {
  await interaction.deferReply({
    flags: MessageFlags.Ephemeral,
  })

  const result = await attemptAsync(
    retryAsyncDecorator(async () => kv.removeItem("pal-discord-status"), {
      delay: createExponetialDelay(0),
      maxTry: 5,
    }),
  )

  if (!result.success) {
    await interaction.editReply({
      content: "Oops!",
    })
  }

  interaction.client.user.setPresence({
    activities: [],
  })

  await interaction.editReply({
    content: "✅",
  })
}

async function subcommandMessageSend(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({
    flags: MessageFlags.Ephemeral,
  })

  const message = interaction.options.getString("message")
  const attachment = interaction.options.getAttachment("attachment")

  if (!message && !attachment) {
    return interaction.editReply({
      content: "I cannot send an empty message!",
    })
  }

  if (!interaction.channel?.isSendable()) {
    return interaction.editReply({
      content: "I cannot send a message on this channel!",
    })
  }

  await interaction.channel.send({
    content: message || "",
    files: attachment ? [attachment.url] : undefined,
  })

  await interaction.editReply({
    content: "✅",
  })
}

export default async (client: Client<true>) => {
  await bootstrapClientStatus(client)

  client.on("interactionCreate", async (interaction) => {
    if (interaction.isChatInputCommand()) {
      switch (interaction.options.getSubcommand()) {
        case "set":
          return await subcommandStatusSet(interaction)
        case "remove":
          return await subcommandStatusRemove(interaction)
        case "message":
          return await subcommandMessageSend(interaction)
        default:
          console.error("Unknown interaction")
      }
    }
  })
}

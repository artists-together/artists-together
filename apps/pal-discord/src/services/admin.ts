import { cloudflare } from "@artists-together/core/cloudflare/client"
import { attemptAsync } from "@artists-together/core/lib/attempt"
import { createExponetialDelay, retryAsyncDecorator } from "ts-retry"
import { Resource } from "sst"
import {
  ActivityType,
  ChatInputCommandInteraction,
  Client,
  MessageFlags,
  // PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js"

export const builder = new SlashCommandBuilder()
  .setName("admin")
  .setDescription("Admin-only commands")
  // .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
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
    retryAsyncDecorator(
      async () =>
        cloudflare.kv.namespaces.values
          .get(Resource.CloudflareKv.id, "pal-discord-status", {
            account_id: Resource.CloudflareAccountId.value,
          })
          .then((response) => response.json())
          .then((json) => json.value),
      {
        delay: createExponetialDelay(20),
        maxTry: 5,
      },
    ),
  )

  if (!result.success) return

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
      async () =>
        cloudflare.kv.namespaces.values.update(
          Resource.CloudflareKv.id,
          "pal-discord-status",
          {
            account_id: Resource.CloudflareAccountId.value,
            metadata: "",
            value: status,
          },
        ),
      {
        delay: createExponetialDelay(20),
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
    content: "👍",
  })
}

async function subcommandStatusRemove(
  interaction: ChatInputCommandInteraction,
) {
  await interaction.deferReply({
    flags: MessageFlags.Ephemeral,
  })

  const result = await attemptAsync(
    retryAsyncDecorator(
      async () =>
        cloudflare.kv.namespaces.values.delete(
          Resource.CloudflareKv.id,
          "pal-discord-status",
          {
            account_id: Resource.CloudflareAccountId.value,
          },
        ),
      {
        delay: createExponetialDelay(20),
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
    activities: [],
  })

  await interaction.editReply({
    content: "👍",
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
      }
    }
  })
}

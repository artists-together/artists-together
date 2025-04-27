import { builder } from "@/services/admin"
import { REST, Routes } from "discord.js"
import { Resource } from "sst"

console.log("⏳ Syncing commands…")

const rest = new REST({ version: "10" }).setToken(
  Resource.DiscordBotSecret.value,
)

const body = [builder.toJSON()]

await rest.put(
  Routes.applicationGuildCommands(
    Resource.DiscordBotId.value,
    Resource.DiscordServerId.value,
  ),
  {
    body,
  },
)

console.log(`✅ Synced ${body.length} command${body.length === 1 ? "" : "s"}`)

import { REST, Routes } from "discord.js"
import * as admin from "../features/admin.ts"

const rest = new REST({ version: "10" }).setToken(
  String(process.env.DISCORD_BOT_TOKEN),
)

const body = [admin.command.toJSON()]

await rest.put(
  Routes.applicationGuildCommands(
    String(process.env.DISCORD_BOT_ID),
    String(process.env.DISCORD_SERVER_ID),
  ),
  { body },
)

console.log(`Synced ${body.length} command${body.length === 1 ? "" : "s"}`)

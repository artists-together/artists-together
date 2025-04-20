import type { RESTOptions } from "@discordjs/rest"
import { REST } from "@discordjs/rest"
import { API } from "@discordjs/core/http-only"
import { Resource } from "sst"

export function createDiscord({
  token,
  ...options
}: Partial<RESTOptions> & { token: string }) {
  const rest = new REST({
    makeRequest: globalThis.fetch as any,
    version: "10",
    ...options,
  }).setToken(token)

  return new API(rest)
}

export const discord = createDiscord({
  authPrefix: "Bot",
  token: Resource.DiscordBotSecret.value,
})

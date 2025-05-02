import { CHANNEL } from "@artists-together/core/discord/constants"
import type { Client } from "discord.js"
import { w } from "w"

const log = {
  getChannel: w("utils:getChannel"),
}

export async function getChannel(
  client: Client<true>,
  channel: keyof typeof CHANNEL,
) {
  const id = CHANNEL[channel]
  const cache = client.channels.cache.get(id)

  if (cache) {
    log.getChannel(`cache hit (${channel})`)
    return cache
  }

  log.getChannel(`cache miss (${channel})`)
  const result = await client.channels.fetch(id)

  if (!result) {
    throw Error(`Could not find channel "${channel}" (${id})`)
  }

  return result
}

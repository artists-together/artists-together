import { ROLE } from "@artists-together/core/discord/constants"
import type { Client } from "discord.js"

export default (client: Client<true>) => {
  client.on("guildMemberAdd", async (member) => {
    if (!member.pending) {
      await member.roles.add(ROLE.FRIEND, "Passed Membership Screening")
    }
  })

  client.on("guildMemberUpdate", async (oldMember, newMember) => {
    if (oldMember.pending !== newMember.pending) {
      await newMember.roles.add(ROLE.FRIEND, "Passed Membership Screening")
    }
  })
}

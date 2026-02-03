import { client } from "../lib/client.ts"
import { ROLE } from "../lib/constants.ts"

client.on("guildMemberAdd", async (member) => {
  if (!member.pending) {
    await member.roles.add(ROLE.UNVERIFIED, "Passed Membership Screening")
  }
})

client.on("guildMemberUpdate", async (memberOld, memberNew) => {
  if (memberOld.pending !== memberNew.pending) {
    await memberNew.roles.add(ROLE.UNVERIFIED, "Passed Membership Screening")
  }
})

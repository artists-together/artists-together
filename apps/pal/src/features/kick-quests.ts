import { CronJob } from "cron"
import { client, getGuild } from "../lib/client.ts"
import { ROLE } from "../lib/constants.ts"

function isInactiveCutoffExceeded(joinedAt: Date | null) {
  if (!joinedAt) return false
  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - 1)
  return joinedAt.getTime() < cutoff.getTime()
}

client.on("clientReady", async () => {
  new CronJob("0 0 * * * ", async () => {
    console.log("[kick-guests] running job")

    const guild = await getGuild()
    const members = await guild.members.fetch()

    console.log("[kick-guests] members size", members.size)

    for await (const [_, member] of members) {
      if (!member.roles.cache.has(ROLE.INACTIVE)) continue
      if (member.roles.cache.has(ROLE.UNVERIFIED)) continue
      if (member.roles.cache.has(ROLE.VERIFIED)) continue

      const timedOut = isInactiveCutoffExceeded(member.joinedAt)

      console.log(`[kick-guests] checking guest: ${member.user.username}`, {
        timedOut,
      })

      if (!timedOut) continue

      console.log(`[kick-guests] sending dm to guest: ${member.user.username}`)

      try {
        await member.user.send(
          "Hello 👋 I’m Pal, assistant bot from the Artists Together community." +
            "\n" +
            "\n" +
            "It looks like you joined the server a while ago but did not accept the rules." +
            "\n" +
            "To mitigate inactivity we have to kick you from the server, but you’re free to join again whenever you want!" +
            "\n" +
            "https://discord.gg/9Ayh9dvhHe",
        )
        console.log(`[kick-guests] kicking guest: ${member.user.username}`)
        await member.kick("Inactivity")
      } catch (error) {
        console.error(
          `[kick-guests] error sending dm to guest: ${member.user.username}`,
          error,
        )
      }
    }
  })
})

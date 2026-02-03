import { Activity, ActivityType, Presence } from "discord.js"
import { client, getGuild } from "../lib/client.ts"
import { ROLE } from "../lib/constants.ts"

function isValidStreamingActivity(activity: Activity) {
  if (activity.type !== ActivityType.Streaming) return false
  switch (activity.state) {
    case "Software and Game Development":
    case "Art":
    case "Food & Drink":
    case "Makers & Crafting":
    case "DJs":
    case "Music":
    case "Miniatures & Models":
    case "Writing & Reading":
    case "Co-working & Studying":
    case "Lego & Brickbuilding":
    case "Beauty and Body Art":
      return true
    default:
      return false
  }
}

function findValidStreamingActivity(presence: Presence | null) {
  return presence?.activities.find((activity) =>
    isValidStreamingActivity(activity),
  )
}

/**
 * Sets the live role to verified users who are streaming
 * in art-related categories.
 */
client.on("clientReady", async () => {
  const guild = await getGuild()

  guild.members.cache.forEach((member) => {
    if (member.user.bot) return

    const hasArtistRole = member.roles.cache.has(ROLE.VERIFIED)
    const hasLiveRole = member.roles.cache.has(ROLE.LIVE_NOW)

    if (hasLiveRole && !hasArtistRole) {
      console.log(
        `[live-users] removing live role - verified role removed while streaming`,
        member.user.username,
      )
      return member.roles.remove(ROLE.LIVE_NOW)
    }

    const activity = findValidStreamingActivity(member.presence)
    if (hasLiveRole && !activity) {
      console.log(
        `[live-users] removing live role - user stopped streaming`,
        member.user.username,
      )

      return member.roles.remove(ROLE.LIVE_NOW)
    }

    if (activity?.url && hasArtistRole && !hasLiveRole) {
      console.log(
        "[live-users] adding live role - user started streaming",
        member.user.username,
      )
      return member.roles.add(ROLE.LIVE_NOW)
    }
  })
})

/**
 * Updates the live role to verified users who are streaming
 * in art-related categories.
 */
client.on("presenceUpdate", (presenceOld, presenceNew) => {
  if (!presenceNew.user) return
  if (!presenceNew.member) return
  if (!presenceNew.member.roles.cache.has(ROLE.VERIFIED)) return

  const activityOld = findValidStreamingActivity(presenceOld)
  const activityNew = findValidStreamingActivity(presenceNew)
  const hasLiveNowRole = presenceNew.member.roles.cache.has(ROLE.LIVE_NOW)

  if (
    activityOld?.url &&
    activityNew?.url &&
    activityOld.url === activityNew.url &&
    hasLiveNowRole
  ) {
    return console.log(
      "[live-users] no action needed - same streaming URL already active",
      presenceNew.user.username,
    )
  }

  if (hasLiveNowRole && !activityNew?.url) {
    console.log(
      "[live-users] removing live role - user stopped streaming",
      presenceNew.user.username,
    )
    return presenceNew.member.roles.remove(ROLE.LIVE_NOW)
  }

  if (!hasLiveNowRole && activityNew?.url) {
    console.log(
      "[live-users] adding live role - user started streaming",
      presenceNew.user.username,
    )
    return presenceNew.member.roles.add(ROLE.LIVE_NOW)
  }
})

import { database, eq } from "@artists-together/core/database/client"
import { livestream } from "@artists-together/core/database/schema"
import { ROLE } from "@artists-together/core/discord/constants"
import { ActivityType, Presence, type Activity, type Client } from "discord.js"
import { createExponetialDelay, retryAsync } from "ts-retry"
import { w } from "w"

const log = w("services:live-role")

function isStreamingActivity(activity: Activity) {
  if (activity.type !== ActivityType.Streaming) {
    return false
  }

  switch (activity.state) {
    case "Software and Game Development":
    case "Art":
    case "Food & Drink":
    case "Makers & Crafting":
    case "DJs":
    case "Music":
    case "Miniatures & Models":
    case "Writting & Reading":
      return true
    default:
      return false
  }
}

function findStreamingActivity(presence: Presence | null) {
  return presence?.activities.find((activity) => isStreamingActivity(activity))
}

export default (client: Client<true>) => {
  client.on("presenceUpdate", async (oldPresence, newPresence) => {
    const member = newPresence.member || oldPresence?.member

    if (!member) {
      return log("Ignoring role update. Missing member property", {
        oldPresence,
        newPresence,
      })
    }

    const oldActivity = findStreamingActivity(oldPresence)
    const newActivity = findStreamingActivity(newPresence)
    const hasLiveRole = member.roles.cache.has(ROLE.LIVE_NOW)

    // Bail out when the streaming URL is the same
    if (
      oldActivity?.url &&
      newActivity?.url &&
      oldActivity.url === newActivity.url &&
      hasLiveRole
    ) {
      return log(
        "Ignoring role update. URLs are the same and user already has role",
        {
          oldActivity,
          newActivity,
        },
      )
    }

    // If still streaming, update the URL
    if (oldActivity?.url && newActivity?.url) {
      const url = newActivity.url
      await retryAsync(
        async () =>
          database
            .update(livestream)
            .set({ url })
            .where(eq(livestream.accountId, member.user.id)),
        {
          delay: createExponetialDelay(0),
        },
      )

      return log("Updated streaming URL", {
        oldActivity,
        newActivity,
      })
    }

    // Stopped streaming
    await member.roles.remove(ROLE.LIVE_NOW)
    await retryAsync(async () =>
      database
        .delete(livestream)
        .where(eq(livestream.accountId, member.user.id)),
    )

    return log("Streaming finished. Removing DB entry and role", {
      oldActivity,
      newActivity,
    })
  })
}

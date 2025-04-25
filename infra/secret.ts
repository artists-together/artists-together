export const secret = {
  cloudflareAccountId: new sst.Secret(
    "CloudflareAccountId",
    sst.cloudflare.DEFAULT_ACCOUNT_ID
  ),
  cloudflareSecret: new sst.Secret(
    "CloudflareSecret",
    process.env.CLOUDFLARE_API_TOKEN
  ),
  discordServerId: new sst.Secret("DiscordServerId", "1096868255454478398"),
  discordBotId: new sst.Secret("DiscordBotId"),
  discordBotSecret: new sst.Secret("DiscordBotSecret"),
  oAuthDiscordId: new sst.Secret("OAuthDiscordId"),
  oAuthDiscordSecret: new sst.Secret("OAuthDiscordSecret"),
  oAuthTwitchId: new sst.Secret("OAuthTwitchId"),
  oAuthTwitchSecret: new sst.Secret("OAuthTwitchSecret"),
}

export const allSecrets = Object.values(secret)

import Cloudflare from "cloudflare"

export const cloudflare = new Cloudflare({
  // TODO: grab this from elsewere or just generate the token
  apiToken: process.env.CLOUDFLARE_API_TOKEN,
})

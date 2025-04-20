import { allSecrets } from "./secret"
import { kv } from "./cloudflare"

new sst.x.DevCommand("PalDiscord", {
  dev: {
    title: "Pal @ Discord",
    command: "pnpm --filter @artists-together/pal-discord dev",
    autostart: false,
  },
  link: [...allSecrets, kv],
})

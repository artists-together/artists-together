import { allSecrets } from "./secret"

new sst.aws.Cron("KickGuestsCron", {
  schedule: "rate(1 day)",
  function: {
    handler: "apps/functions/src/cron/kicker.handler",
    link: [...allSecrets],
  },
})

new sst.aws.Cron("TestCron", {
  schedule: "rate(1 hour)",
  function: {
    handler: "apps/functions/src/cron/test.handler",
    link: [...allSecrets],
  },
})

/// <reference path="./.sst/platform/config.d.ts" />
export default $config({
  app(input) {
    return {
      name: "artists-together",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: input?.stage === "production",
      home: "aws",
      providers: {
        cloudflare: "5.39.0",
        turso: {
          version: "0.2.3",
          organization: process.env.TURSO_ORGANIZATION,
          apiToken: process.env.TURSO_API_TOKEN,
        },
        vercel: "1.14.3",
      },
    }
  },
  async run() {
    await import("./infra")
  },
});

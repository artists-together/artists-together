import { Resource } from "sst"
import { createStorage } from "unstorage"
import cloudflareKVHTTPDriver from "unstorage/drivers/cloudflare-kv-http"

export const kv = createStorage({
  driver: cloudflareKVHTTPDriver({
    accountId: Resource.CloudflareAccountId.value,
    namespaceId: Resource.CloudflareKv.id,
    apiToken: String(process.env.CLOUDFLARE_API_TOKEN),
  }),
})

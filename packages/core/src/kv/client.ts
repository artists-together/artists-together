import { Resource } from "sst"
import { createStorage } from "unstorage"
import cloudflareKVHTTPDriver from "unstorage/drivers/cloudflare-kv-http"

export const kv = createStorage({
  driver: cloudflareKVHTTPDriver({
    apiToken: Resource.CloudflareSecret.value,
    accountId: Resource.CloudflareAccountId.value,
    namespaceId: Resource.CloudflareKv.id,
  }),
})

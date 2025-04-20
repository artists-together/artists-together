sst.Linkable.wrap(sst.cloudflare.Kv, (resource) => ({
  properties: {
    id: resource.id,
  },
}))

export const kv = new sst.cloudflare.Kv("CloudflareKv")

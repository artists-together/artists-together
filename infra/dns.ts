// These domain names are temporary while I figure out how all of this works :)

export const domain =
  {
    production: "artiststogether.carlo.works",
  }[$app.stage] || $app.stage + "artiststogether.preview.carlo.works"

export const zone = cloudflare.getZoneOutput({
  name: "carlo.works",
})

export const dns = sst.cloudflare.dns({
  zone: zone.id,
})

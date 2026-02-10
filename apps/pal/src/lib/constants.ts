export const CHANNEL = {
  ABOUT:
    process.env.NODE_ENV === "production"
      ? "766783113568976896"
      : "1101914026096734412",
  ANNOUNCEMENTS:
    process.env.NODE_ENV === "production"
      ? "766882582688170004"
      : "1101914069537132645",
  EVENTS:
    process.env.NODE_ENV === "production"
      ? "1101454527816802315"
      : "1376134786804088924",
  ARTISTS_RAID_TRAIN:
    process.env.NODE_ENV === "production"
      ? "1153278996570710026"
      : "1198610257732190218",
  ART_EMERGENCIES:
    process.env.NODE_ENV === "production"
      ? "969979594373472316"
      : "1099334764835651624",
  BOT_SHENANIGANS:
    process.env.NODE_ENV === "production"
      ? "774144500007174145"
      : "1102173767549071361",
  INTRODUCTIONS:
    process.env.NODE_ENV === "production"
      ? "1133112638272974928"
      : "1099296890538963016",
  RULES_N_FAQ:
    process.env.NODE_ENV === "production"
      ? "766783113568976896"
      : "1100827654355161188",
  NEWS:
    process.env.NODE_ENV === "production"
      ? "1101176459290214591"
      : "1373625182865985557",
} as const

export const ROLE = {
  ADMIN:
    process.env.NODE_ENV === "production"
      ? "762898079862882367"
      : "1096870186461696152",
  MOD:
    process.env.NODE_ENV === "production"
      ? "766375640639209472"
      : "1101842475947139122",
  VERIFIED:
    process.env.NODE_ENV === "production"
      ? "766376379456421918"
      : "1101560472685248583",
  UNVERIFIED:
    process.env.NODE_ENV === "production"
      ? "766932970107699211"
      : "1099296505438937088",
  INACTIVE:
    process.env.NODE_ENV === "production"
      ? "1101174650018480168"
      : "1099287460715954246",
  PAL:
    process.env.NODE_ENV === "production"
      ? "1101885930429755464"
      : "1101913205380485122",
  TECH_SUPPORT:
    process.env.NODE_ENV === "production"
      ? "784147921444667443"
      : "1101842721532035194",
  LIVE_NOW:
    process.env.NODE_ENV === "production"
      ? "776685926998867980"
      : "1100357964772151317",
  WEB:
    process.env.NODE_ENV === "production"
      ? "1147242776040321074"
      : "1231623420634988565",
}

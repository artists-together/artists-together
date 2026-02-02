export const CHANNEL = {
  ABOUT:
    process.env.NODE_ENV === "development"
      ? "1101914026096734412"
      : "766783113568976896",
  ANNOUNCEMENTS:
    process.env.NODE_ENV === "development"
      ? "1101914069537132645"
      : "766882582688170004",
  EVENTS:
    process.env.NODE_ENV === "development"
      ? "1376134786804088924"
      : "1101454527816802315",
  ARTISTS_RAID_TRAIN:
    process.env.NODE_ENV === "development"
      ? "1198610257732190218"
      : "1153278996570710026",
  ART_EMERGENCIES:
    process.env.NODE_ENV === "development"
      ? "1099334764835651624"
      : "969979594373472316",
  BOT_SHENANIGANS:
    process.env.NODE_ENV === "development"
      ? "1102173767549071361"
      : "774144500007174145",
  INTRODUCTIONS:
    process.env.NODE_ENV === "development"
      ? "1099296890538963016"
      : "1133112638272974928",
  RULES_N_FAQ:
    process.env.NODE_ENV === "development"
      ? "1100827654355161188"
      : "766783113568976896",
  NEWS:
    process.env.NODE_ENV === "development"
      ? "1373625182865985557"
      : "1101176459290214591",
} as const

export const ROLE = {
  ADMIN:
    process.env.NODE_ENV === "development"
      ? "1096870186461696152"
      : "762898079862882367",
  MOD:
    process.env.NODE_ENV === "development"
      ? "1101842475947139122"
      : "766375640639209472",
  VERIFIED:
    process.env.NODE_ENV === "development"
      ? "1101560472685248583"
      : "766376379456421918",
  UNVERIFIED:
    process.env.NODE_ENV === "development"
      ? "1099296505438937088"
      : "766932970107699211",
  INACTIVE:
    process.env.NODE_ENV === "development"
      ? "1099287460715954246"
      : "1101174650018480168",
  PAL:
    process.env.NODE_ENV === "development"
      ? "1101913205380485122"
      : "1101885930429755464",
  TECH_SUPPORT:
    process.env.NODE_ENV === "development"
      ? "1101842721532035194"
      : "784147921444667443",
  LIVE_NOW:
    process.env.NODE_ENV === "development"
      ? "1100357964772151317"
      : "776685926998867980",
  WEB:
    process.env.NODE_ENV === "development"
      ? "1231623420634988565"
      : "1147242776040321074",
}

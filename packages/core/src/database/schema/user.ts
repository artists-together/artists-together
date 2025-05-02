import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { timestamps } from "../types"

export const user = sqliteTable("user", {
  ...timestamps,
  id: text().primaryKey(),
  username: text().notNull().unique(),
  pronouns: text(),
  email: text().notNull().unique(),
  image: text(),
  bio: text(),
})

export type UserSelect = typeof user.$inferSelect
export type UserInsert = typeof user.$inferInsert

export const userSetting = sqliteTable("user_setting", {
  ...timestamps,
  id: integer().primaryKey(),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export type UserSettingSelect = typeof userSetting.$inferSelect
export type UserSettingInsert = typeof userSetting.$inferInsert

export const userLink = sqliteTable("user_link", {
  ...timestamps,
  id: integer().primaryKey(),
  userId: text()
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  url: text().notNull(),
})

export type UserLinkSelect = typeof userLink.$inferSelect
export type UserLinkInsert = typeof userLink.$inferInsert

export const session = sqliteTable("session", {
  ...timestamps,
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = sqliteTable("account", {
  ...timestamps,
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
})

export const verification = sqliteTable("verification", {
  ...timestamps,
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
})

export const livestream = sqliteTable("livestream", {
  ...timestamps,
  accountId: text()
    .notNull()
    .references(() => account.accountId, { onDelete: "cascade" }),
  url: text().notNull(),
})

export type LivestreamSelect = typeof livestream.$inferSelect
export type LivestreamInsert = typeof livestream.$inferInsert
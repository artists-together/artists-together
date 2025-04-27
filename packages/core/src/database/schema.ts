import { sql } from "drizzle-orm"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const userTable = sqliteTable("user", {
  id: integer().primaryKey(),
  username: text().notNull().unique(),
  avatar: text(),
  email: text().unique(),
  bio: text(),
  discordId: text().unique(),
  discordUsername: text().unique(),
  twitchId: text().unique(),
  twitchUsername: text().unique(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
})

export const liveUserTable = sqliteTable("live_user", {
  discordId: text()
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  url: text().notNull(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
})

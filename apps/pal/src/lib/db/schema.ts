import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const inactiveUserActivity = sqliteTable("inactive_user_activity", {
  userId: text().primaryKey(),
  lastOnlineAt: integer().notNull(),
})

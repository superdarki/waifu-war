import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const submissionsTable = sqliteTable("submissions", {
  id: text().primaryKey(),
  type: text(),
  category: text(),
  data: text('data', { mode: 'json' }),
});
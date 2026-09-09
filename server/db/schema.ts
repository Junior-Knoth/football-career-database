import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const games = sqliteTable("games", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  name: text("name").notNull().unique(),
});

export const saves = sqliteTable("saves", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  name: text("name").notNull(),
  gameId: integer("game_id")
    .notNull()
    .references(() => games.id, { onDelete: "restrict" }),
});

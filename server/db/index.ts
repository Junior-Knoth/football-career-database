import "dotenv/config";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

const databasePath = process.env.DB_FILE_NAME;

if (!databasePath) {
  throw new Error("DB_FILE_NAME is not defined.");
}

const sqlite = new Database(databasePath);

sqlite.pragma("foreign_keys = ON");

export const db = drizzle({
  client: sqlite,
});

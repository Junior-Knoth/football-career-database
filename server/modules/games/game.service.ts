import { asc, eq } from "drizzle-orm";

import { db } from "../../db/index.ts";
import { games as gamesTable } from "../../db/schema.ts";

const gameFields = {
  id: gamesTable.id,
  name: gamesTable.name,
};

export async function listGames() {
  return db.select(gameFields).from(gamesTable).orderBy(asc(gamesTable.name));
}

export async function getGameById(id: number) {
  return db
    .select(gameFields)
    .from(gamesTable)
    .where(eq(gamesTable.id, id))
    .limit(1);
}

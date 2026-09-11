import { asc, eq } from "drizzle-orm";

import { db } from "../../db/index.ts";
import { games as gamesTable } from "../../db/schema.ts";

export async function listGames() {
  return db
    .select({
      id: gamesTable.id,
      name: gamesTable.name,
    })
    .from(gamesTable)
    .orderBy(asc(gamesTable.name));
}

export async function getGameById(id: number) {
  return db
    .select({
      id: gamesTable.id,
      name: gamesTable.name,
    })
    .from(gamesTable)
    .where(eq(gamesTable.id, id))
    .limit(1);
}

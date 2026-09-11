import { asc, eq } from "drizzle-orm";

import { db } from "../../db/index.ts";
import { games } from "../../db/schema.ts";

export async function listGames() {
  return db
    .select({
      id: games.id,
      name: games.name,
    })
    .from(games)
    .orderBy(asc(games.name));
}

export async function getGameById(id: number) {
  return db
    .select({
      id: games.id,
      name: games.name,
    })
    .from(games)
    .where(eq(games.id, id))
    .limit(1);
}

import { asc } from "drizzle-orm";

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

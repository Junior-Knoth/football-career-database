import { asc, eq } from "drizzle-orm";
import { db } from "../../db/index.ts";
import { games, saves } from "../../db/schema.ts";

export type CreateSaveInput = {
  name: string;
  gameId: number;
};

export type CreateSaveOutput = {
  id: number;
  name: string;
  gameId: number;
};

export async function createSave(
  input: CreateSaveInput,
): Promise<CreateSaveOutput> {
  const name = input.name.trim();

  const [inserted] = await db
    .insert(saves)
    .values({
      name,
      gameId: input.gameId,
    })
    .returning();

  return inserted;
}

export async function listSaves() {
  return db
    .select({
      id: saves.id,
      name: saves.name,
      game: {
        gameId: games.id,
        gameName: games.name,
      },
    })
    .from(saves)
    .innerJoin(games, eq(saves.gameId, games.id))
    .orderBy(asc(saves.name));
}

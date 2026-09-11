import { asc, eq } from "drizzle-orm";
import { db } from "../../db/index.ts";
import { games as gamesTable, saves as savesTable } from "../../db/schema.ts";

export type CreateSaveInput = {
  name: string;
  gameId: number;
};

export type CreateSaveOutput = {
  id: number;
  name: string;
  gameId: number;
};

type SaveQuery = {
  gameId?: string;
};

export async function createSave(
  input: CreateSaveInput,
): Promise<CreateSaveOutput> {
  const name = input.name.trim();

  const [inserted] = await db
    .insert(savesTable)
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
      id: savesTable.id,
      name: savesTable.name,
      game: {
        id: gamesTable.id,
        name: gamesTable.name,
      },
    })
    .from(savesTable)
    .innerJoin(gamesTable, eq(savesTable.gameId, gamesTable.id))
    .orderBy(asc(savesTable.name));
}

export async function getSaveById(id: number) {
  const [save] = await db
    .select({
      id: savesTable.id,
      name: savesTable.name,
      game: {
        id: gamesTable.id,
        name: gamesTable.name,
      },
    })
    .from(savesTable)
    .where(eq(savesTable.id, id))
    .innerJoin(gamesTable, eq(savesTable.gameId, gamesTable.id))
    .limit(1);

  return save ?? null;
}

export async function getSavesByGameId(gameId: number) {
  return db
    .select({
      id: savesTable.id,
      name: savesTable.name,
      game: {
        id: gamesTable.id,
        name: gamesTable.name,
      },
    })
    .from(savesTable)
    .where(eq(savesTable.gameId, gameId))
    .innerJoin(gamesTable, eq(savesTable.gameId, gamesTable.id))
    .orderBy(asc(savesTable.name));
}

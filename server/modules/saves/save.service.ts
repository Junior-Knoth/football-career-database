import { asc, eq } from "drizzle-orm";
import { db } from "../../db/index.ts";
import { games as gamesTable, saves as savesTable } from "../../db/schema.ts";

export type CreateSaveInput = {
  name: string;
  gameId: number;
  status: "active" | "finished" | "archived";
  currentSeasonId: number | null;
  managerName: string;
  managerBirthDate: string;
  managerNationalityId: number | null;
};

export type UpdateSaveInput = {
  name?: string;
  managerName?: string;
  managerBirthDate?: string;
  managerNationalityId?: number;
  status?: "active" | "finished" | "archived";
};

export type CreateSaveOutput = {
  id: number;
  name: string;
  gameId: number;
};

type Save = {
  id: number;
  name: string;
  game: {
    id: number;
    name: string;
  };
};

const saveFields = {
  id: savesTable.id,
  name: savesTable.name,
  status: savesTable.status,
  game: {
    id: gamesTable.id,
    name: gamesTable.name,
  },
  manager: {
    name: savesTable.managerName,
    birthDate: savesTable.managerBirthDate,
    nationalityId: savesTable.managerNationalityId,
  },
};

export async function createSave(input: CreateSaveInput): Promise<Save> {
  const name = input.name.trim();

  const [inserted] = await db
    .insert(savesTable)
    .values({
      name,
      gameId: input.gameId,
      status: "active",
      currentSeasonId: null,
      managerName: input.managerName,
      managerBirthDate: input.managerBirthDate,
      managerNationalityId: input.managerNationalityId,
    })
    .returning({ id: savesTable.id });

  const fullSave = await getSaveById(inserted.id);

  return fullSave;
}

export async function deleteSave(
  id: number,
): Promise<{ id: number; name: string } | null> {
  const [deletedSave] = await db
    .delete(savesTable)
    .where(eq(savesTable.id, id))
    .returning({
      id: savesTable.id,
      name: savesTable.name,
    });

  return deletedSave ?? null;
}

export async function updateSave(
  id: number,
  input: UpdateSaveInput,
): Promise<Save | null> {
  const updateData: Partial<typeof savesTable.$inferInsert> = {};

  if (input.name !== undefined) {
    const name = input.name.trim();

    if (!name) {
      throw new Error("O nome da carreira não pode estar vazio.");
    }

    updateData.name = name;
  }

  if (input.managerName !== undefined) {
    const managerName = input.managerName.trim();

    if (!managerName) {
      throw new Error("O nome do treinador não pode estar vazio.");
    }

    updateData.managerName = managerName;
  }

  if (input.managerBirthDate !== undefined) {
    const managerBirthDate = input.managerBirthDate.trim();

    if (!managerBirthDate) {
      throw new Error("A data de nascimento não pode estar vazia.");
    }

    updateData.managerBirthDate = managerBirthDate;
  }

  if (input.managerNationalityId !== undefined) {
    updateData.managerNationalityId = input.managerNationalityId;
  }

  if (input.status !== undefined) {
    updateData.status = input.status;
  }

  if (Object.keys(updateData).length === 0) {
    throw new Error("Nenhum campo foi informado para atualização.");
  }

  const [updatedSave] = await db
    .update(savesTable)
    .set(updateData)
    .where(eq(savesTable.id, id))
    .returning({
      id: savesTable.id,
    });

  if (!updatedSave) {
    return null;
  }

  return getSaveById(updatedSave.id);
}

export async function listSaves() {
  return db
    .select(saveFields)
    .from(savesTable)
    .innerJoin(gamesTable, eq(savesTable.gameId, gamesTable.id))
    .orderBy(asc(savesTable.name));
}

export async function getSaveById(id: number) {
  const [save] = await db
    .select(saveFields)
    .from(savesTable)
    .where(eq(savesTable.id, id))
    .innerJoin(gamesTable, eq(savesTable.gameId, gamesTable.id))
    .limit(1);

  return save ?? null;
}

export async function getSavesByGameId(gameId: number) {
  return db
    .select(saveFields)
    .from(savesTable)
    .where(eq(savesTable.gameId, gameId))
    .innerJoin(gamesTable, eq(savesTable.gameId, gamesTable.id))
    .orderBy(asc(savesTable.name));
}

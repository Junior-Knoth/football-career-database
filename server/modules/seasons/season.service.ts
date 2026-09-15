import { and, asc, desc, eq, ne } from "drizzle-orm";

import { db } from "../../db/index.ts";
import {
  saves as savesTable,
  seasons as seasonsTable,
} from "../../db/schema.ts";

export type Season = {
  id: number;
  saveId: number;
  label: string;
  startDate: string;
  endDate: string;
  orderIndex: number;
};

export type CreateSeasonInput = {
  saveId: number;
  label: string;
  startDate: string;
  endDate: string;
};

export type UpdateSeasonInput = {
  label?: string;
  startDate?: string;
  endDate?: string;
};

export type SetCurrentSeasonResult = {
  saveId: number;
  currentSeasonId: number;
};

export class SeasonServiceError extends Error {
  readonly statusCode: 400 | 404;

  constructor(message: string, statusCode: 400 | 404) {
    super(message);
    this.statusCode = statusCode;
  }
}

const seasonFields = {
  id: seasonsTable.id,
  saveId: seasonsTable.saveId,
  label: seasonsTable.label,
  startDate: seasonsTable.startDate,
  endDate: seasonsTable.endDate,
  orderIndex: seasonsTable.orderIndex,
};

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

function validateDates(startDate: string, endDate: string) {
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    throw new SeasonServiceError("Datas da temporada inválidas.", 400);
  }

  if (startDate > endDate) {
    throw new SeasonServiceError(
      "A data inicial não pode ser posterior à data final.",
      400,
    );
  }
}

async function ensureUniqueLabel(
  saveId: number,
  label: string,
  seasonId?: number,
) {
  const conditions = [
    eq(seasonsTable.saveId, saveId),
    eq(seasonsTable.label, label),
  ];

  if (seasonId !== undefined) {
    conditions.push(ne(seasonsTable.id, seasonId));
  }

  const [existingSeason] = await db
    .select({ id: seasonsTable.id })
    .from(seasonsTable)
    .where(and(...conditions))
    .limit(1);

  if (existingSeason) {
    throw new SeasonServiceError(
      "Já existe uma temporada com esse nome nesta carreira.",
      400,
    );
  }
}

export async function listSeasonsBySaveId(saveId: number): Promise<Season[]> {
  return db
    .select(seasonFields)
    .from(seasonsTable)
    .where(eq(seasonsTable.saveId, saveId))
    .orderBy(asc(seasonsTable.orderIndex));
}

export async function getSeasonById(id: number): Promise<Season | null> {
  const [season] = await db
    .select(seasonFields)
    .from(seasonsTable)
    .where(eq(seasonsTable.id, id))
    .limit(1);

  return season ?? null;
}

export async function createSeason(input: CreateSeasonInput): Promise<Season> {
  const label = input.label.trim();

  if (!label) {
    throw new SeasonServiceError(
      "O nome da temporada não pode estar vazio.",
      400,
    );
  }

  validateDates(input.startDate, input.endDate);

  return db.transaction((tx) => {
    const [save] = tx
      .select({
        id: savesTable.id,
        currentSeasonId: savesTable.currentSeasonId,
      })
      .from(savesTable)
      .where(eq(savesTable.id, input.saveId))
      .limit(1)
      .all();

    if (!save) {
      throw new SeasonServiceError("Carreira não encontrada.", 404);
    }

    const [existingSeason] = tx
      .select({ id: seasonsTable.id })
      .from(seasonsTable)
      .where(
        and(
          eq(seasonsTable.saveId, input.saveId),
          eq(seasonsTable.label, label),
        ),
      )
      .limit(1)
      .all();

    if (existingSeason) {
      throw new SeasonServiceError(
        "Já existe uma temporada com esse nome nesta carreira.",
        400,
      );
    }

    const [lastSeason] = tx
      .select({ orderIndex: seasonsTable.orderIndex })
      .from(seasonsTable)
      .where(eq(seasonsTable.saveId, input.saveId))
      .orderBy(desc(seasonsTable.orderIndex))
      .limit(1)
      .all();

    const [season] = tx
      .insert(seasonsTable)
      .values({
        saveId: input.saveId,
        label,
        startDate: input.startDate,
        endDate: input.endDate,
        orderIndex: (lastSeason?.orderIndex ?? 0) + 1,
      })
      .returning(seasonFields)
      .all();

    if (save.currentSeasonId === null) {
      tx.update(savesTable)
        .set({ currentSeasonId: season.id })
        .where(eq(savesTable.id, input.saveId))
        .run();
    }

    return season;
  });
}

export async function updateSeason(
  id: number,
  input: UpdateSeasonInput,
): Promise<Season | null> {
  const season = await getSeasonById(id);

  if (!season) {
    return null;
  }

  const label = input.label === undefined ? season.label : input.label.trim();
  const startDate = input.startDate ?? season.startDate;
  const endDate = input.endDate ?? season.endDate;

  if (!label) {
    throw new SeasonServiceError(
      "O nome da temporada não pode estar vazio.",
      400,
    );
  }

  validateDates(startDate, endDate);

  if (label !== season.label) {
    await ensureUniqueLabel(season.saveId, label, season.id);
  }

  const [updatedSeason] = await db
    .update(seasonsTable)
    .set({
      ...(input.label !== undefined ? { label } : {}),
      ...(input.startDate !== undefined ? { startDate } : {}),
      ...(input.endDate !== undefined ? { endDate } : {}),
    })
    .where(eq(seasonsTable.id, id))
    .returning(seasonFields);

  return updatedSeason ?? null;
}

export async function deleteSeason(id: number): Promise<Season | null> {
  const [deletedSeason] = await db
    .delete(seasonsTable)
    .where(eq(seasonsTable.id, id))
    .returning(seasonFields);

  return deletedSeason ?? null;
}

export async function setCurrentSeason(
  saveId: number,
  seasonId: number,
): Promise<SetCurrentSeasonResult> {
  const [save] = await db
    .select({ id: savesTable.id })
    .from(savesTable)
    .where(eq(savesTable.id, saveId))
    .limit(1);

  if (!save) {
    throw new SeasonServiceError("Carreira não encontrada.", 404);
  }

  const season = await getSeasonById(seasonId);

  if (!season) {
    throw new SeasonServiceError("Temporada não encontrada.", 404);
  }

  if (season.saveId !== saveId) {
    throw new SeasonServiceError(
      "A temporada não pertence a esta carreira.",
      400,
    );
  }

  await db
    .update(savesTable)
    .set({ currentSeasonId: seasonId })
    .where(eq(savesTable.id, saveId));

  return {
    saveId,
    currentSeasonId: seasonId,
  };
}

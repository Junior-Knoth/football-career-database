import { and, asc, eq, like, ne, sql, type SQL } from "drizzle-orm";

import { db } from "../../db/index.ts";
import {
  countries as countriesTable,
  teams as teamsTable,
} from "../../db/schema.ts";

export type TeamType = "club" | "national";

export type Team = {
  id: number;
  name: string;
  shortName: string | null;
  shortCode: string | null;
  type: TeamType;
  countryId: number;
  country: {
    id: number;
    name: string;
    flagCode: string;
    shortCode: string;
  };
};

export type TeamFilters = {
  type?: TeamType;
  countryId?: number;
  search?: string;
};

export type CreateTeamInput = {
  name: string;
  shortName?: string | null;
  shortCode?: string | null;
  type: TeamType;
  countryId: number;
};

export type UpdateTeamInput = {
  name?: string;
  shortName?: string | null;
  shortCode?: string | null;
  countryId?: number;
};

export class TeamServiceError extends Error {
  readonly statusCode: 400 | 404 | 409;

  constructor(message: string, statusCode: 400 | 404 | 409) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const teamFields = {
  id: teamsTable.id,
  name: teamsTable.name,
  shortName: teamsTable.shortName,
  shortCode: teamsTable.shortCode,
  type: teamsTable.type,
  countryId: teamsTable.countryId,
  country: {
    id: countriesTable.id,
    name: countriesTable.name,
    flagCode: countriesTable.flagCode,
    shortCode: countriesTable.shortCode,
  },
};

function normalizeOptionalText(value: string | null | undefined) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  return value.trim() || null;
}

async function ensureCountryExists(countryId: number) {
  const [country] = await db
    .select({ id: countriesTable.id })
    .from(countriesTable)
    .where(eq(countriesTable.id, countryId))
    .limit(1);

  if (!country) {
    throw new TeamServiceError("País não encontrado.", 404);
  }
}

async function findDuplicateTeam(
  name: string,
  type: TeamType,
  countryId: number,
  excludedTeamId?: number,
) {
  const conditions: SQL[] = [
    sql`lower(trim(${teamsTable.name})) = lower(${name})`,
    eq(teamsTable.type, type),
    eq(teamsTable.countryId, countryId),
  ];

  if (excludedTeamId !== undefined) {
    conditions.push(ne(teamsTable.id, excludedTeamId));
  }

  const [team] = await db
    .select({ id: teamsTable.id })
    .from(teamsTable)
    .where(and(...conditions))
    .limit(1);

  return team ?? null;
}

export async function listTeams(filters: TeamFilters = {}): Promise<Team[]> {
  const conditions: SQL[] = [];

  if (filters.type !== undefined) {
    conditions.push(eq(teamsTable.type, filters.type));
  }

  if (filters.countryId !== undefined) {
    conditions.push(eq(teamsTable.countryId, filters.countryId));
  }

  const search = filters.search?.trim();

  if (search) {
    conditions.push(like(teamsTable.name, `%${search}%`));
  }

  return db
    .select(teamFields)
    .from(teamsTable)
    .innerJoin(countriesTable, eq(teamsTable.countryId, countriesTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(teamsTable.name));
}

export async function getTeamById(id: number): Promise<Team | null> {
  const [team] = await db
    .select(teamFields)
    .from(teamsTable)
    .innerJoin(countriesTable, eq(teamsTable.countryId, countriesTable.id))
    .where(eq(teamsTable.id, id))
    .limit(1);

  return team ?? null;
}

export async function createTeam(input: CreateTeamInput): Promise<Team> {
  const name = input.name.trim();

  if (!name) {
    throw new TeamServiceError("O nome do time não pode estar vazio.", 400);
  }

  await ensureCountryExists(input.countryId);

  const duplicate = await findDuplicateTeam(name, input.type, input.countryId);

  if (duplicate) {
    throw new TeamServiceError(
      "Já existe um time com esse nome, tipo e país.",
      409,
    );
  }

  const [inserted] = await db
    .insert(teamsTable)
    .values({
      name,
      shortName: normalizeOptionalText(input.shortName),
      shortCode: normalizeOptionalText(input.shortCode),
      type: input.type,
      countryId: input.countryId,
    })
    .returning({ id: teamsTable.id });

  const team = await getTeamById(inserted.id);

  if (!team) {
    throw new Error("Não foi possível carregar o time criado.");
  }

  return team;
}

export async function updateTeam(
  id: number,
  input: UpdateTeamInput,
): Promise<Team | null> {
  const team = await getTeamById(id);

  if (!team) {
    return null;
  }

  const name = input.name === undefined ? team.name : input.name.trim();
  const countryId = input.countryId ?? team.countryId;

  if (!name) {
    throw new TeamServiceError("O nome do time não pode estar vazio.", 400);
  }

  if (input.countryId !== undefined) {
    await ensureCountryExists(input.countryId);
  }

  const duplicate = await findDuplicateTeam(name, team.type, countryId, id);

  if (duplicate) {
    throw new TeamServiceError(
      "Já existe um time com esse nome, tipo e país.",
      409,
    );
  }

  await db
    .update(teamsTable)
    .set({
      ...(input.name !== undefined ? { name } : {}),
      ...(input.shortName !== undefined
        ? { shortName: normalizeOptionalText(input.shortName) }
        : {}),
      ...(input.shortCode !== undefined
        ? { shortCode: normalizeOptionalText(input.shortCode) }
        : {}),
      ...(input.countryId !== undefined ? { countryId } : {}),
    })
    .where(eq(teamsTable.id, id));

  return getTeamById(id);
}

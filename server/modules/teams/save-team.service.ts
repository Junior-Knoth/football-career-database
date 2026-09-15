import { and, asc, eq, type SQL } from "drizzle-orm";

import { db } from "../../db/index.ts";
import {
  countries as countriesTable,
  saves as savesTable,
  saveTeams as saveTeamsTable,
  teams as teamsTable,
} from "../../db/schema.ts";
import type { Team, TeamType } from "./team.service.ts";

export type SaveTeam = {
  id: number;
  saveId: number;
  teamId: number;
  team: Team;
};

export type SaveTeamFilters = {
  type?: TeamType;
};

export type CreateSaveTeamInput = {
  saveId: number;
  teamId: number;
};

export class SaveTeamServiceError extends Error {
  readonly statusCode: 404 | 409;

  constructor(message: string, statusCode: 404 | 409) {
    super(message);
    this.statusCode = statusCode;
  }
}

const saveTeamFields = {
  id: saveTeamsTable.id,
  saveId: saveTeamsTable.saveId,
  teamId: saveTeamsTable.teamId,
  teamName: teamsTable.name,
  teamShortName: teamsTable.shortName,
  teamShortCode: teamsTable.shortCode,
  teamType: teamsTable.type,
  teamCountryId: teamsTable.countryId,
  countryName: countriesTable.name,
  countryFlagCode: countriesTable.flagCode,
  countryShortCode: countriesTable.shortCode,
};

type SaveTeamRow = Awaited<ReturnType<typeof selectSaveTeamRows>>[number];

function selectSaveTeamRows() {
  return db
    .select(saveTeamFields)
    .from(saveTeamsTable)
    .innerJoin(teamsTable, eq(saveTeamsTable.teamId, teamsTable.id))
    .innerJoin(countriesTable, eq(teamsTable.countryId, countriesTable.id));
}

export function mapSaveTeam(row: SaveTeamRow): SaveTeam {
  return {
    id: row.id,
    saveId: row.saveId,
    teamId: row.teamId,
    team: {
      id: row.teamId,
      name: row.teamName,
      shortName: row.teamShortName,
      shortCode: row.teamShortCode,
      type: row.teamType,
      countryId: row.teamCountryId,
      country: {
        id: row.teamCountryId,
        name: row.countryName,
        flagCode: row.countryFlagCode,
        shortCode: row.countryShortCode,
      },
    },
  };
}

async function ensureSaveExists(saveId: number) {
  const [save] = await db
    .select({ id: savesTable.id })
    .from(savesTable)
    .where(eq(savesTable.id, saveId))
    .limit(1);

  if (!save) {
    throw new SaveTeamServiceError("Carreira não encontrada.", 404);
  }
}

async function ensureTeamExists(teamId: number) {
  const [team] = await db
    .select({ id: teamsTable.id })
    .from(teamsTable)
    .where(eq(teamsTable.id, teamId))
    .limit(1);

  if (!team) {
    throw new SaveTeamServiceError("Time não encontrado.", 404);
  }
}

export async function listSaveTeamsBySaveId(
  saveId: number,
  filters: SaveTeamFilters = {},
): Promise<SaveTeam[]> {
  await ensureSaveExists(saveId);

  const conditions: SQL[] = [eq(saveTeamsTable.saveId, saveId)];

  if (filters.type !== undefined) {
    conditions.push(eq(teamsTable.type, filters.type));
  }

  const rows = await selectSaveTeamRows()
    .where(and(...conditions))
    .orderBy(asc(teamsTable.name));

  return rows.map(mapSaveTeam);
}

export async function getSaveTeamById(id: number): Promise<SaveTeam | null> {
  const [saveTeam] = await selectSaveTeamRows()
    .where(eq(saveTeamsTable.id, id))
    .limit(1);

  return saveTeam ? mapSaveTeam(saveTeam) : null;
}

export async function createSaveTeam(
  input: CreateSaveTeamInput,
): Promise<SaveTeam> {
  await ensureSaveExists(input.saveId);
  await ensureTeamExists(input.teamId);

  const [duplicate] = await db
    .select({ id: saveTeamsTable.id })
    .from(saveTeamsTable)
    .where(
      and(
        eq(saveTeamsTable.saveId, input.saveId),
        eq(saveTeamsTable.teamId, input.teamId),
      ),
    )
    .limit(1);

  if (duplicate) {
    throw new SaveTeamServiceError(
      "Este time já está associado a esta carreira.",
      409,
    );
  }

  const [inserted] = await db
    .insert(saveTeamsTable)
    .values(input)
    .returning({ id: saveTeamsTable.id });

  const saveTeam = await getSaveTeamById(inserted.id);

  if (!saveTeam) {
    throw new Error("Não foi possível carregar o time associado.");
  }

  return saveTeam;
}

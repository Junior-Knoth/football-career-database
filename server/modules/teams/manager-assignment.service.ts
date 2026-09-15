import {
  and,
  desc,
  eq,
  isNotNull,
  isNull,
  type SQL,
} from "drizzle-orm";

import { db } from "../../db/index.ts";
import {
  countries as countriesTable,
  managerAssignments as managerAssignmentsTable,
  saves as savesTable,
  saveTeams as saveTeamsTable,
  seasons as seasonsTable,
  teams as teamsTable,
} from "../../db/schema.ts";
import type { SaveTeam } from "./save-team.service.ts";
import type { TeamType } from "./team.service.ts";

export type ManagerAssignment = {
  id: number;
  saveId: number;
  saveTeamId: number;
  startSeasonId: number;
  endSeasonId: number | null;
  startDate: string | null;
  endDate: string | null;
  startSeason: {
    id: number;
    label: string;
    orderIndex: number;
  };
  saveTeam: SaveTeam;
};

export type ManagerAssignmentFilters = {
  type?: TeamType;
  active?: boolean;
};

export type CreateManagerAssignmentInput = {
  saveId: number;
  saveTeamId: number;
  startSeasonId: number;
  endSeasonId?: number | null;
  startDate?: string | null;
  endDate?: string | null;
};

export class ManagerAssignmentServiceError extends Error {
  readonly statusCode: 400 | 404 | 409;

  constructor(message: string, statusCode: 400 | 404 | 409) {
    super(message);
    this.statusCode = statusCode;
  }
}

const managerAssignmentFields = {
  id: managerAssignmentsTable.id,
  saveId: managerAssignmentsTable.saveId,
  saveTeamId: managerAssignmentsTable.saveTeamId,
  startSeasonId: managerAssignmentsTable.startSeasonId,
  endSeasonId: managerAssignmentsTable.endSeasonId,
  startDate: managerAssignmentsTable.startDate,
  endDate: managerAssignmentsTable.endDate,
  startSeasonLabel: seasonsTable.label,
  startSeasonOrderIndex: seasonsTable.orderIndex,
  saveTeamSaveId: saveTeamsTable.saveId,
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

type ManagerAssignmentRow = Awaited<
  ReturnType<typeof selectManagerAssignmentRows>
>[number];

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

async function ensureSaveExists(saveId: number) {
  const [save] = await db
    .select({ id: savesTable.id })
    .from(savesTable)
    .where(eq(savesTable.id, saveId))
    .limit(1);

  if (!save) {
    throw new ManagerAssignmentServiceError("Carreira não encontrada.", 404);
  }
}

function selectManagerAssignmentRows() {
  return db
    .select(managerAssignmentFields)
    .from(managerAssignmentsTable)
    .innerJoin(
      saveTeamsTable,
      eq(managerAssignmentsTable.saveTeamId, saveTeamsTable.id),
    )
    .innerJoin(teamsTable, eq(saveTeamsTable.teamId, teamsTable.id))
    .innerJoin(countriesTable, eq(teamsTable.countryId, countriesTable.id))
    .innerJoin(
      seasonsTable,
      eq(managerAssignmentsTable.startSeasonId, seasonsTable.id),
    );
}

function mapManagerAssignment(row: ManagerAssignmentRow): ManagerAssignment {
  return {
    id: row.id,
    saveId: row.saveId,
    saveTeamId: row.saveTeamId,
    startSeasonId: row.startSeasonId,
    endSeasonId: row.endSeasonId,
    startDate: row.startDate,
    endDate: row.endDate,
    startSeason: {
      id: row.startSeasonId,
      label: row.startSeasonLabel,
      orderIndex: row.startSeasonOrderIndex,
    },
    saveTeam: {
      id: row.saveTeamId,
      saveId: row.saveTeamSaveId,
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
    },
  };
}

export async function listManagerAssignmentsBySaveId(
  saveId: number,
  filters: ManagerAssignmentFilters = {},
): Promise<ManagerAssignment[]> {
  await ensureSaveExists(saveId);

  const conditions: SQL[] = [eq(managerAssignmentsTable.saveId, saveId)];

  if (filters.type !== undefined) {
    conditions.push(eq(teamsTable.type, filters.type));
  }

  if (filters.active !== undefined) {
    conditions.push(
      filters.active
        ? isNull(managerAssignmentsTable.endSeasonId)
        : isNotNull(managerAssignmentsTable.endSeasonId),
    );
  }

  const rows = await selectManagerAssignmentRows()
    .where(and(...conditions))
    .orderBy(desc(seasonsTable.orderIndex), desc(managerAssignmentsTable.id));

  return rows.map(mapManagerAssignment);
}

export async function getManagerAssignmentById(
  id: number,
): Promise<ManagerAssignment | null> {
  const [assignment] = await selectManagerAssignmentRows()
    .where(eq(managerAssignmentsTable.id, id))
    .limit(1);

  return assignment ? mapManagerAssignment(assignment) : null;
}

export async function getCurrentManagerAssignment(
  saveId: number,
  type: TeamType,
): Promise<ManagerAssignment | null> {
  await ensureSaveExists(saveId);

  const [assignment] = await selectManagerAssignmentRows()
    .where(
      and(
        eq(managerAssignmentsTable.saveId, saveId),
        eq(teamsTable.type, type),
        isNull(managerAssignmentsTable.endSeasonId),
      ),
    )
    .orderBy(desc(seasonsTable.orderIndex), desc(managerAssignmentsTable.id))
    .limit(1);

  return assignment ? mapManagerAssignment(assignment) : null;
}

export async function createManagerAssignment(
  input: CreateManagerAssignmentInput,
): Promise<ManagerAssignment> {
  await ensureSaveExists(input.saveId);

  const [saveTeam] = await db
    .select({
      id: saveTeamsTable.id,
      saveId: saveTeamsTable.saveId,
      teamType: teamsTable.type,
    })
    .from(saveTeamsTable)
    .innerJoin(teamsTable, eq(saveTeamsTable.teamId, teamsTable.id))
    .where(eq(saveTeamsTable.id, input.saveTeamId))
    .limit(1);

  if (!saveTeam) {
    throw new ManagerAssignmentServiceError(
      "Time associado não encontrado.",
      404,
    );
  }

  if (saveTeam.saveId !== input.saveId) {
    throw new ManagerAssignmentServiceError(
      "O time associado não pertence a esta carreira.",
      400,
    );
  }

  const [startSeason] = await db
    .select({
      id: seasonsTable.id,
      saveId: seasonsTable.saveId,
      orderIndex: seasonsTable.orderIndex,
    })
    .from(seasonsTable)
    .where(eq(seasonsTable.id, input.startSeasonId))
    .limit(1);

  if (!startSeason) {
    throw new ManagerAssignmentServiceError(
      "Temporada inicial não encontrada.",
      404,
    );
  }

  if (startSeason.saveId !== input.saveId) {
    throw new ManagerAssignmentServiceError(
      "A temporada inicial não pertence a esta carreira.",
      400,
    );
  }

  let endSeason: { saveId: number; orderIndex: number } | undefined;

  if (input.endSeasonId !== undefined && input.endSeasonId !== null) {
    const [foundEndSeason] = await db
      .select({
        saveId: seasonsTable.saveId,
        orderIndex: seasonsTable.orderIndex,
      })
      .from(seasonsTable)
      .where(eq(seasonsTable.id, input.endSeasonId))
      .limit(1);

    if (!foundEndSeason) {
      throw new ManagerAssignmentServiceError(
        "Temporada final não encontrada.",
        404,
      );
    }

    endSeason = foundEndSeason;

    if (endSeason.saveId !== input.saveId) {
      throw new ManagerAssignmentServiceError(
        "A temporada final não pertence a esta carreira.",
        400,
      );
    }

    if (endSeason.orderIndex < startSeason.orderIndex) {
      throw new ManagerAssignmentServiceError(
        "A temporada final não pode ser anterior à temporada inicial.",
        400,
      );
    }
  }

  if (input.startDate !== undefined && input.startDate !== null) {
    if (!isValidDate(input.startDate)) {
      throw new ManagerAssignmentServiceError("Data inicial inválida.", 400);
    }
  }

  if (input.endDate !== undefined && input.endDate !== null) {
    if (!isValidDate(input.endDate)) {
      throw new ManagerAssignmentServiceError("Data final inválida.", 400);
    }
  }

  if (
    input.startDate !== undefined &&
    input.startDate !== null &&
    input.endDate !== undefined &&
    input.endDate !== null &&
    input.endDate < input.startDate
  ) {
    throw new ManagerAssignmentServiceError(
      "A data final não pode ser anterior à data inicial.",
      400,
    );
  }

  const isActive = input.endSeasonId === undefined || input.endSeasonId === null;

  if (isActive) {
    const [activeAssignment] = await db
      .select({ id: managerAssignmentsTable.id })
      .from(managerAssignmentsTable)
      .innerJoin(
        saveTeamsTable,
        eq(managerAssignmentsTable.saveTeamId, saveTeamsTable.id),
      )
      .innerJoin(teamsTable, eq(saveTeamsTable.teamId, teamsTable.id))
      .where(
        and(
          eq(managerAssignmentsTable.saveId, input.saveId),
          eq(teamsTable.type, saveTeam.teamType),
          isNull(managerAssignmentsTable.endSeasonId),
        ),
      )
      .limit(1);

    if (activeAssignment) {
      const teamTypeLabel = saveTeam.teamType === "club" ? "clube" : "seleção";

      throw new ManagerAssignmentServiceError(
        `Já existe um assignment ativo de ${teamTypeLabel} nesta carreira.`,
        409,
      );
    }
  }

  const [inserted] = await db
    .insert(managerAssignmentsTable)
    .values({
      saveId: input.saveId,
      saveTeamId: input.saveTeamId,
      startSeasonId: input.startSeasonId,
      endSeasonId: input.endSeasonId ?? null,
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
    })
    .returning({ id: managerAssignmentsTable.id });

  const assignment = await getManagerAssignmentById(inserted.id);

  if (!assignment) {
    throw new Error("Não foi possível carregar o assignment criado.");
  }

  return assignment;
}

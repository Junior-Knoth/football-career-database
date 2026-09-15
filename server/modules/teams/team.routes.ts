import type { FastifyPluginAsync, FastifyReply } from "fastify";

import { isValidId } from "../../utils/validation.ts";
import {
  createManagerAssignment,
  getCurrentManagerAssignment,
  getManagerAssignmentById,
  listManagerAssignmentsBySaveId,
  ManagerAssignmentServiceError,
  type CreateManagerAssignmentInput,
} from "./manager-assignment.service.ts";
import {
  createSaveTeam,
  getSaveTeamById,
  listSaveTeamsBySaveId,
  SaveTeamServiceError,
} from "./save-team.service.ts";
import {
  createTeam,
  getTeamById,
  listTeams,
  TeamServiceError,
  updateTeam,
  type CreateTeamInput,
  type TeamType,
  type UpdateTeamInput,
} from "./team.service.ts";

type RouteData = Record<string, unknown>;

const teamTypes: TeamType[] = ["club", "national"];
const teamCreateFields = [
  "name",
  "shortName",
  "shortCode",
  "type",
  "countryId",
];
const teamUpdateFields = ["name", "shortName", "shortCode", "countryId"];
const teamQueryFields = ["type", "countryId", "search"];
const saveTeamCreateFields = ["saveId", "teamId"];
const saveTeamQueryFields = ["saveId", "type"];
const assignmentCreateFields = [
  "saveId",
  "saveTeamId",
  "startSeasonId",
  "endSeasonId",
  "startDate",
  "endDate",
];
const assignmentQueryFields = ["saveId", "type", "active"];
const currentAssignmentQueryFields = ["saveId", "type"];

function isRecord(value: unknown): value is RouteData {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTeamType(value: unknown): value is TeamType {
  return typeof value === "string" && teamTypes.includes(value as TeamType);
}

function isOptionalText(value: unknown) {
  return value === undefined || value === null || typeof value === "string";
}

function isOptionalDate(value: unknown) {
  return value === undefined || value === null || isValidDate(value);
}

function isValidDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

function findUnknownField(data: RouteData, allowedFields: string[]) {
  return Object.keys(data).find((key) => !allowedFields.includes(key));
}

function sendUnknownField(reply: FastifyReply, field: string) {
  return reply.code(400).send({ message: `Campo não permitido: ${field}` });
}

function sendServiceError(reply: FastifyReply, error: unknown) {
  if (
    error instanceof TeamServiceError ||
    error instanceof SaveTeamServiceError ||
    error instanceof ManagerAssignmentServiceError
  ) {
    return reply.code(error.statusCode).send({ message: error.message });
  }

  throw error;
}

export const teamRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Querystring: RouteData }>("/", async (request, reply) => {
    const query = request.query;
    const unknownField = findUnknownField(query, teamQueryFields);

    if (unknownField) {
      return sendUnknownField(reply, unknownField);
    }

    if (query.type !== undefined && !isTeamType(query.type)) {
      return reply.code(400).send({ message: "Tipo de time inválido" });
    }

    const countryId =
      query.countryId === undefined ? undefined : Number(query.countryId);

    if (countryId !== undefined && !isValidId(countryId)) {
      return reply.code(400).send({ message: "ID do país inválido" });
    }

    if (query.search !== undefined && typeof query.search !== "string") {
      return reply.code(400).send({ message: "Busca por time inválida" });
    }

    return listTeams({
      ...(isTeamType(query.type) ? { type: query.type } : {}),
      ...(countryId !== undefined ? { countryId } : {}),
      ...(typeof query.search === "string" ? { search: query.search } : {}),
    });
  });

  app.get<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const id = Number(request.params.id);

    if (!isValidId(id)) {
      return reply.code(400).send({ message: "ID do time inválido" });
    }

    const team = await getTeamById(id);

    if (!team) {
      return reply.code(404).send({ message: "Time não encontrado" });
    }

    return reply.send(team);
  });

  app.post<{ Body: RouteData }>("/", async (request, reply) => {
    const body = request.body;

    if (!isRecord(body)) {
      return reply.code(400).send({ message: "Dados do time inválidos" });
    }

    const unknownField = findUnknownField(body, teamCreateFields);

    if (unknownField) {
      return sendUnknownField(reply, unknownField);
    }

    if (typeof body.name !== "string" || body.name.trim() === "") {
      return reply.code(400).send({ message: "Nome do time inválido" });
    }

    if (!isTeamType(body.type)) {
      return reply.code(400).send({ message: "Tipo de time inválido" });
    }

    if (typeof body.countryId !== "number" || !isValidId(body.countryId)) {
      return reply.code(400).send({ message: "ID do país inválido" });
    }

    if (!isOptionalText(body.shortName)) {
      return reply.code(400).send({ message: "Nome curto inválido" });
    }

    if (!isOptionalText(body.shortCode)) {
      return reply.code(400).send({ message: "Código curto inválido" });
    }

    const input: CreateTeamInput = {
      name: body.name,
      type: body.type,
      countryId: body.countryId,
      ...(typeof body.shortName === "string" || body.shortName === null
        ? { shortName: body.shortName }
        : {}),
      ...(typeof body.shortCode === "string" || body.shortCode === null
        ? { shortCode: body.shortCode }
        : {}),
    };

    try {
      const team = await createTeam(input);
      return reply.code(201).send(team);
    } catch (error) {
      return sendServiceError(reply, error);
    }
  });

  app.patch<{
    Params: { id: string };
    Body: RouteData;
  }>("/:id", async (request, reply) => {
    const id = Number(request.params.id);
    const body = request.body;

    if (!isValidId(id)) {
      return reply.code(400).send({ message: "ID do time inválido" });
    }

    if (!isRecord(body) || Object.keys(body).length === 0) {
      return reply
        .code(400)
        .send({ message: "Nenhum campo foi informado para atualização" });
    }

    const unknownField = findUnknownField(body, teamUpdateFields);

    if (unknownField) {
      return sendUnknownField(reply, unknownField);
    }

    if (
      body.name !== undefined &&
      (typeof body.name !== "string" || body.name.trim() === "")
    ) {
      return reply.code(400).send({ message: "Nome do time inválido" });
    }

    if (!isOptionalText(body.shortName)) {
      return reply.code(400).send({ message: "Nome curto inválido" });
    }

    if (!isOptionalText(body.shortCode)) {
      return reply.code(400).send({ message: "Código curto inválido" });
    }

    if (
      body.countryId !== undefined &&
      (typeof body.countryId !== "number" || !isValidId(body.countryId))
    ) {
      return reply.code(400).send({ message: "ID do país inválido" });
    }

    const input: UpdateTeamInput = {
      ...(typeof body.name === "string" ? { name: body.name } : {}),
      ...(typeof body.shortName === "string" || body.shortName === null
        ? { shortName: body.shortName }
        : {}),
      ...(typeof body.shortCode === "string" || body.shortCode === null
        ? { shortCode: body.shortCode }
        : {}),
      ...(typeof body.countryId === "number"
        ? { countryId: body.countryId }
        : {}),
    };

    try {
      const team = await updateTeam(id, input);

      if (!team) {
        return reply.code(404).send({ message: "Time não encontrado" });
      }

      return reply.send(team);
    } catch (error) {
      return sendServiceError(reply, error);
    }
  });
};

export const saveTeamRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Querystring: RouteData }>("/", async (request, reply) => {
    const query = request.query;
    const unknownField = findUnknownField(query, saveTeamQueryFields);

    if (unknownField) {
      return sendUnknownField(reply, unknownField);
    }

    const saveId = Number(query.saveId);

    if (!isValidId(saveId)) {
      return reply.code(400).send({ message: "ID da carreira inválido" });
    }

    if (query.type !== undefined && !isTeamType(query.type)) {
      return reply.code(400).send({ message: "Tipo de time inválido" });
    }

    try {
      return await listSaveTeamsBySaveId(saveId, {
        ...(isTeamType(query.type) ? { type: query.type } : {}),
      });
    } catch (error) {
      return sendServiceError(reply, error);
    }
  });

  app.get<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const id = Number(request.params.id);

    if (!isValidId(id)) {
      return reply.code(400).send({ message: "ID do time associado inválido" });
    }

    const saveTeam = await getSaveTeamById(id);

    if (!saveTeam) {
      return reply.code(404).send({ message: "Time associado não encontrado" });
    }

    return reply.send(saveTeam);
  });

  app.post<{ Body: RouteData }>("/", async (request, reply) => {
    const body = request.body;

    if (!isRecord(body)) {
      return reply
        .code(400)
        .send({ message: "Dados do time associado inválidos" });
    }

    const unknownField = findUnknownField(body, saveTeamCreateFields);

    if (unknownField) {
      return sendUnknownField(reply, unknownField);
    }

    if (typeof body.saveId !== "number" || !isValidId(body.saveId)) {
      return reply.code(400).send({ message: "ID da carreira inválido" });
    }

    if (typeof body.teamId !== "number" || !isValidId(body.teamId)) {
      return reply.code(400).send({ message: "ID do time inválido" });
    }

    try {
      const saveTeam = await createSaveTeam({
        saveId: body.saveId,
        teamId: body.teamId,
      });

      return reply.code(201).send(saveTeam);
    } catch (error) {
      return sendServiceError(reply, error);
    }
  });
};

export const managerAssignmentRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Querystring: RouteData }>("/current", async (request, reply) => {
    const query = request.query;
    const unknownField = findUnknownField(query, currentAssignmentQueryFields);

    if (unknownField) {
      return sendUnknownField(reply, unknownField);
    }

    const saveId = Number(query.saveId);

    if (!isValidId(saveId)) {
      return reply.code(400).send({ message: "ID da carreira inválido" });
    }

    if (!isTeamType(query.type)) {
      return reply.code(400).send({ message: "Tipo de time inválido" });
    }

    try {
      const assignment = await getCurrentManagerAssignment(saveId, query.type);
      return reply.send(assignment);
    } catch (error) {
      return sendServiceError(reply, error);
    }
  });

  app.get<{ Querystring: RouteData }>("/", async (request, reply) => {
    const query = request.query;
    const unknownField = findUnknownField(query, assignmentQueryFields);

    if (unknownField) {
      return sendUnknownField(reply, unknownField);
    }

    const saveId = Number(query.saveId);

    if (!isValidId(saveId)) {
      return reply.code(400).send({ message: "ID da carreira inválido" });
    }

    if (query.type !== undefined && !isTeamType(query.type)) {
      return reply.code(400).send({ message: "Tipo de time inválido" });
    }

    if (
      query.active !== undefined &&
      query.active !== "true" &&
      query.active !== "false"
    ) {
      return reply.code(400).send({ message: "Filtro de atividade inválido" });
    }

    try {
      return await listManagerAssignmentsBySaveId(saveId, {
        ...(isTeamType(query.type) ? { type: query.type } : {}),
        ...(query.active === "true"
          ? { active: true }
          : query.active === "false"
            ? { active: false }
            : {}),
      });
    } catch (error) {
      return sendServiceError(reply, error);
    }
  });

  app.get<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const id = Number(request.params.id);

    if (!isValidId(id)) {
      return reply.code(400).send({ message: "ID do assignment inválido" });
    }

    const assignment = await getManagerAssignmentById(id);

    if (!assignment) {
      return reply.code(404).send({ message: "Assignment não encontrado" });
    }

    return reply.send(assignment);
  });

  app.post<{ Body: RouteData }>("/", async (request, reply) => {
    const body = request.body;

    if (!isRecord(body)) {
      return reply.code(400).send({ message: "Dados do assignment inválidos" });
    }

    const unknownField = findUnknownField(body, assignmentCreateFields);

    if (unknownField) {
      return sendUnknownField(reply, unknownField);
    }

    if (typeof body.saveId !== "number" || !isValidId(body.saveId)) {
      return reply.code(400).send({ message: "ID da carreira inválido" });
    }

    if (typeof body.saveTeamId !== "number" || !isValidId(body.saveTeamId)) {
      return reply.code(400).send({ message: "ID do time associado inválido" });
    }

    if (
      typeof body.startSeasonId !== "number" ||
      !isValidId(body.startSeasonId)
    ) {
      return reply.code(400).send({ message: "ID da temporada inicial inválido" });
    }

    if (
      body.endSeasonId !== undefined &&
      body.endSeasonId !== null &&
      (typeof body.endSeasonId !== "number" || !isValidId(body.endSeasonId))
    ) {
      return reply.code(400).send({ message: "ID da temporada final inválido" });
    }

    if (!isOptionalDate(body.startDate)) {
      return reply.code(400).send({ message: "Data inicial inválida" });
    }

    if (!isOptionalDate(body.endDate)) {
      return reply.code(400).send({ message: "Data final inválida" });
    }

    if (
      typeof body.startDate === "string" &&
      typeof body.endDate === "string" &&
      body.endDate < body.startDate
    ) {
      return reply
        .code(400)
        .send({ message: "A data final não pode ser anterior à data inicial" });
    }

    const input: CreateManagerAssignmentInput = {
      saveId: body.saveId,
      saveTeamId: body.saveTeamId,
      startSeasonId: body.startSeasonId,
      ...(typeof body.endSeasonId === "number" || body.endSeasonId === null
        ? { endSeasonId: body.endSeasonId }
        : {}),
      ...(typeof body.startDate === "string" || body.startDate === null
        ? { startDate: body.startDate }
        : {}),
      ...(typeof body.endDate === "string" || body.endDate === null
        ? { endDate: body.endDate }
        : {}),
    };

    try {
      const assignment = await createManagerAssignment(input);
      return reply.code(201).send(assignment);
    } catch (error) {
      return sendServiceError(reply, error);
    }
  });
};

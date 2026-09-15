import type { FastifyPluginAsync, FastifyReply } from "fastify";

import { isValidId } from "../../utils/validation.ts";
import {
  createSeason,
  deleteSeason,
  getSeasonById,
  listSeasonsBySaveId,
  SeasonServiceError,
  updateSeason,
  type CreateSeasonInput,
  type UpdateSeasonInput,
} from "./season.service.ts";

type SeasonParams = {
  id: string;
};

type SeasonQuery = {
  saveId?: string;
};

type SeasonBody = Record<string, unknown>;

const createFields = ["saveId", "label", "startDate", "endDate"];
const updateFields = ["label", "startDate", "endDate"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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

function hasUnknownField(
  body: Record<string, unknown>,
  allowedFields: string[],
) {
  return Object.keys(body).find((key) => !allowedFields.includes(key));
}

function sendSeasonServiceError(reply: FastifyReply, error: unknown) {
  if (error instanceof SeasonServiceError) {
    return reply.code(error.statusCode).send({ message: error.message });
  }

  throw error;
}

export const seasonRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Querystring: SeasonQuery }>("/", async (request, reply) => {
    const saveId = Number(request.query.saveId);

    if (!isValidId(saveId)) {
      return reply.code(400).send({ message: "ID da carreira inválido" });
    }

    return listSeasonsBySaveId(saveId);
  });

  app.get<{ Params: SeasonParams }>("/:id", async (request, reply) => {
    const id = Number(request.params.id);

    if (!isValidId(id)) {
      return reply.code(400).send({ message: "ID da temporada inválido" });
    }

    const season = await getSeasonById(id);

    if (!season) {
      return reply.code(404).send({ message: "Temporada não encontrada" });
    }

    return reply.send(season);
  });

  app.post<{ Body: SeasonBody }>("/", async (request, reply) => {
    const body = request.body;

    if (!isRecord(body)) {
      return reply.code(400).send({ message: "Dados da temporada inválidos" });
    }

    const unknownField = hasUnknownField(body, createFields);

    if (unknownField) {
      return reply.code(400).send({
        message: `Campo não permitido: ${unknownField}`,
      });
    }

    if (typeof body.saveId !== "number" || !isValidId(body.saveId)) {
      return reply.code(400).send({ message: "ID da carreira inválido" });
    }

    if (typeof body.label !== "string" || body.label.trim() === "") {
      return reply.code(400).send({ message: "Nome da temporada inválido" });
    }

    if (!isValidDate(body.startDate) || !isValidDate(body.endDate)) {
      return reply.code(400).send({ message: "Datas da temporada inválidas" });
    }

    if (body.startDate > body.endDate) {
      return reply.code(400).send({
        message: "A data inicial não pode ser posterior à data final",
      });
    }

    const input: CreateSeasonInput = {
      saveId: body.saveId,
      label: body.label,
      startDate: body.startDate,
      endDate: body.endDate,
    };

    try {
      const season = await createSeason(input);
      return reply.code(201).send(season);
    } catch (error) {
      return sendSeasonServiceError(reply, error);
    }
  });

  app.patch<{
    Params: SeasonParams;
    Body: SeasonBody;
  }>("/:id", async (request, reply) => {
    const id = Number(request.params.id);
    const body = request.body;

    if (!isValidId(id)) {
      return reply.code(400).send({ message: "ID da temporada inválido" });
    }

    if (!isRecord(body) || Object.keys(body).length === 0) {
      return reply
        .code(400)
        .send({ message: "Nenhum campo foi informado para atualização" });
    }

    const unknownField = hasUnknownField(body, updateFields);

    if (unknownField) {
      return reply.code(400).send({
        message: `Campo não permitido: ${unknownField}`,
      });
    }

    if (
      body.label !== undefined &&
      (typeof body.label !== "string" || body.label.trim() === "")
    ) {
      return reply.code(400).send({ message: "Nome da temporada inválido" });
    }

    if (body.startDate !== undefined && !isValidDate(body.startDate)) {
      return reply.code(400).send({ message: "Data inicial inválida" });
    }

    if (body.endDate !== undefined && !isValidDate(body.endDate)) {
      return reply.code(400).send({ message: "Data final inválida" });
    }

    if (
      isValidDate(body.startDate) &&
      isValidDate(body.endDate) &&
      body.startDate > body.endDate
    ) {
      return reply.code(400).send({
        message: "A data inicial não pode ser posterior à data final",
      });
    }

    const input: UpdateSeasonInput = {
      ...(typeof body.label === "string" ? { label: body.label } : {}),
      ...(typeof body.startDate === "string"
        ? { startDate: body.startDate }
        : {}),
      ...(typeof body.endDate === "string" ? { endDate: body.endDate } : {}),
    };

    try {
      const season = await updateSeason(id, input);

      if (!season) {
        return reply.code(404).send({ message: "Temporada não encontrada" });
      }

      return reply.send(season);
    } catch (error) {
      return sendSeasonServiceError(reply, error);
    }
  });

  app.delete<{ Params: SeasonParams }>("/:id", async (request, reply) => {
    const id = Number(request.params.id);

    if (!isValidId(id)) {
      return reply.code(400).send({ message: "ID da temporada inválido" });
    }

    const season = await deleteSeason(id);

    if (!season) {
      return reply.code(404).send({ message: "Temporada não encontrada" });
    }

    return reply.send(season);
  });
};

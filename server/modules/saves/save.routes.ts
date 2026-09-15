import type { FastifyPluginAsync } from "fastify";
import {
  createSave,
  deleteSave,
  getSaveById,
  getSavesByGameId,
  listSaves,
  updateSave,
  type CreateSaveInput,
  type UpdateSaveInput,
} from "./save.service.ts";
import { isValidId } from "../../utils/validation.ts";
import {
  SeasonServiceError,
  setCurrentSeason,
} from "../seasons/season.service.ts";

export type SaveParams = {
  id: string;
};

type SaveQuery = {
  gameId?: string;
};

type DeleteParams = {
  id: string;
};

type CurrentSeasonParams = {
  saveId: string;
};

type CurrentSeasonBody = {
  seasonId?: unknown;
};

export const saveRoutes: FastifyPluginAsync = async (app) => {
  app.post<{ Body: CreateSaveInput }>("/", async (request, reply) => {
    const saveData = await createSave(request.body);
    return reply.code(201).send(saveData);
  });

  const allowedStatuses = ["active", "finished", "archived"] as const;

  const allowedUpdateFields = [
    "name",
    "managerName",
    "managerBirthDate",
    "managerNationalityId",
    "status",
  ];

  app.patch<{
    Params: CurrentSeasonParams;
    Body: CurrentSeasonBody;
  }>("/:saveId/current-season", async (request, reply) => {
    const saveId = Number(request.params.saveId);
    const body = request.body;

    if (!isValidId(saveId)) {
      return reply.code(400).send({ message: "ID da carreira inválido" });
    }

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      Object.keys(body).length !== 1 ||
      !("seasonId" in body) ||
      !isValidId(body.seasonId as number)
    ) {
      return reply.code(400).send({ message: "ID da temporada inválido" });
    }

    try {
      const result = await setCurrentSeason(saveId, body.seasonId as number);
      return reply.send(result);
    } catch (error) {
      if (error instanceof SeasonServiceError) {
        return reply.code(error.statusCode).send({ message: error.message });
      }

      throw error;
    }
  });

  app.patch<{
    Params: SaveParams;
    Body: UpdateSaveInput;
  }>("/:id", async (request, reply) => {
    const id = Number(request.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return reply.status(400).send({
        message: "ID do save inválido",
      });
    }

    const input = request.body;

    if (!input || Object.keys(input).length === 0) {
      return reply.status(400).send({
        message: "Nenhum campo foi informado para atualização",
      });
    }

    const unknownField = Object.keys(input).find(
      (key) => !allowedUpdateFields.includes(key),
    );

    if (unknownField) {
      return reply.status(400).send({
        message: `Campo não permitido: ${unknownField}`,
      });
    }

    if (
      input.name !== undefined &&
      (typeof input.name !== "string" || input.name.trim() === "")
    ) {
      return reply.status(400).send({
        message: "Nome da carreira inválido",
      });
    }

    if (
      input.managerName !== undefined &&
      (typeof input.managerName !== "string" || input.managerName.trim() === "")
    ) {
      return reply.status(400).send({
        message: "Nome do treinador inválido",
      });
    }

    if (
      input.managerBirthDate !== undefined &&
      (typeof input.managerBirthDate !== "string" ||
        input.managerBirthDate.trim() === "")
    ) {
      return reply.status(400).send({
        message: "Data de nascimento inválida",
      });
    }

    if (
      input.managerNationalityId !== undefined &&
      (!Number.isInteger(input.managerNationalityId) ||
        input.managerNationalityId <= 0)
    ) {
      return reply.status(400).send({
        message: "Nacionalidade inválida",
      });
    }

    if (input.status !== undefined && !allowedStatuses.includes(input.status)) {
      return reply.status(400).send({
        message: "Status inválido",
      });
    }

    const updatedSave = await updateSave(id, input);

    if (!updatedSave) {
      return reply.status(404).send({
        message: "Save não encontrado",
      });
    }

    return reply.status(200).send(updatedSave);
  });

  app.delete<{
    Params: DeleteParams;
  }>("/:id", async (request, reply) => {
    const id = Number(request.params.id);

    if (!isValidId(id)) {
      return reply.code(400).send({ error: "Invalid save ID" });
    }

    const deletedSave = await deleteSave(id);

    return reply.code(200).send(deletedSave);
  });

  app.get<{
    Params: SaveParams;
  }>("/:id", async (request, reply) => {
    const id = Number(request.params.id);

    if (!isValidId(id)) {
      return reply.code(400).send({ error: "Invalid save ID" });
    }

    const save = await getSaveById(id);

    if (!save) {
      return reply.code(404).send({ error: "Save not found" });
    }

    return reply.send(save);
  });

  app.get<{
    Querystring: SaveQuery;
  }>("/", async (request, reply) => {
    const { gameId } = request.query;

    if (gameId === undefined) {
      return listSaves();
    }

    const parsedGameId = Number(gameId);

    if (!Number.isInteger(parsedGameId) || parsedGameId <= 0) {
      return reply.code(400).send({
        error: "Invalid game ID",
      });
    }

    return getSavesByGameId(parsedGameId);
  });
};

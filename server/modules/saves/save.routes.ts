import type { FastifyPluginAsync } from "fastify";
import {
  createSave,
  getSaveById,
  getSavesByGameId,
  listSaves,
  type CreateSaveInput,
} from "./save.service.ts";

export type SaveParams = {
  id: string;
};

type SaveQuery = {
  gameId?: string;
};

export const saveRoutes: FastifyPluginAsync = async (app) => {
  app.post<{ Body: CreateSaveInput }>("/", async (request, reply) => {
    const saveData = await createSave(request.body);
    return reply.code(201).send(saveData);
  });

  app.get<{
    Params: SaveParams;
  }>("/:id", async (request, reply) => {
    const id = Number(request.params.id);

    if (!Number.isInteger(id) || id <= 0) {
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

import type { FastifyPluginAsync } from "fastify";
import { getGameById, listGames } from "./game.service.ts";

export const gameRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", async () => {
    return listGames();
  });

  app.get<{
    Params: { id: string };
  }>("/:id", async (request, reply) => {
    const id = Number(request.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return reply.code(400).send({ error: "Invalid game ID" });
    }

    if (isNaN(id)) {
      return reply.code(400).send({ error: "Invalid game ID" });
    }

    const game = await getGameById(id);

    if (!game) {
      return reply.code(404).send({ error: "Game not found" });
    }

    return reply.send(game);
  });
};

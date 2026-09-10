import type { FastifyPluginAsync } from "fastify";
import { listGames } from "./game.service.ts";

export const gameRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", async () => {
    return listGames();
  });
};

import type { FastifyPluginAsync } from "fastify";
import { createSave, listSaves, type CreateSaveInput } from "./save.service.ts";

export const saveRoutes: FastifyPluginAsync = async (app) => {
  app.post<{ Body: CreateSaveInput }>("/", async (request, reply) => {
    const saveData = await createSave(request.body);
    return reply.code(201).send(saveData);
  });

  app.get("/", async () => {
    return listSaves();
  });
};

import type { FastifyPluginAsync } from "fastify";
import {
  createSave,
  getSaveById,
  listSaves,
  type CreateSaveInput,
} from "./save.service.ts";

export type SaveParams = {
  id: string;
};

export const saveRoutes: FastifyPluginAsync = async (app) => {
  app.post<{ Body: CreateSaveInput }>("/", async (request, reply) => {
    const saveData = await createSave(request.body);
    return reply.code(201).send(saveData);
  });

  app.get("/", async () => {
    return listSaves();
  });

  app.get<{
    Params: SaveParams;
  }>("/:id", async (request, reply) => {
    const id = Number(request.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return reply.code(400).send({ error: "Invalid save ID" });
    }

    if (isNaN(id)) {
      return reply.code(400).send({ error: "Invalid save ID" });
    }

    const save = await getSaveById(id);

    if (!save) {
      return reply.code(404).send({ error: "Save not found" });
    }

    return reply.send(save);
  });
};

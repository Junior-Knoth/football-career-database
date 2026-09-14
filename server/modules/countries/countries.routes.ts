import type { FastifyPluginAsync } from "fastify";
import { getCountryById, listCountries } from "./countries.service.ts";
import { isValidId } from "../../utils/validation.ts";

export const countryRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", async () => {
    return listCountries();
  });

  app.get<{
    Params: { id: string };
  }>("/:id", async (request, reply) => {
    const id = Number(request.params.id);

    if (!isValidId(id)) {
      return reply.code(400).send({ error: "Invalid country ID" });
    }

    const country = await getCountryById(id);

    if (!country) {
      return reply.code(404).send({ error: "Country not found" });
    }

    return reply.send(country);
  });
};

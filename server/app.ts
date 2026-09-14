import fastify from "fastify";
import { gameRoutes } from "./modules/games/game.routes.ts";
import { saveRoutes } from "./modules/saves/save.routes.ts";
import { countryRoutes } from "./modules/countries/countries.routes.ts";

export function buildApp() {
  const app = fastify({
    logger: true,
  });

  app.register(gameRoutes, {
    prefix: "/api/games",
  });

  app.register(saveRoutes, {
    prefix: "/api/saves",
  });

  app.register(countryRoutes, {
    prefix: "/api/countries",
  });
  return app;
}

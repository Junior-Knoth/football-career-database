import fastify from "fastify";
import { gameRoutes } from "./modules/games/game.routes.ts";
import { saveRoutes } from "./modules/saves/save.routes.ts";
import { countryRoutes } from "./modules/countries/countries.routes.ts";
import { seasonRoutes } from "./modules/seasons/season.routes.ts";
import {
  managerAssignmentRoutes,
  saveTeamRoutes,
  teamRoutes,
} from "./modules/teams/team.routes.ts";

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

  app.register(seasonRoutes, {
    prefix: "/api/seasons",
  });

  app.register(teamRoutes, {
    prefix: "/api/teams",
  });

  app.register(saveTeamRoutes, {
    prefix: "/api/save-teams",
  });

  app.register(managerAssignmentRoutes, {
    prefix: "/api/manager-assignments",
  });

  return app;
}

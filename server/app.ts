import fastify from "fastify";

export function BuildApp() {
  const app = fastify({
    logger: true,
  });

  app.get("/api/player", async () => {
    return {
      status: "ok",
      player_name: "Cristiano Ronaldo",
    };
  });

  return app;
}

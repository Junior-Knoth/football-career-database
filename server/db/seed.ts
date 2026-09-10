import { db } from "./index.ts";
import { games } from "./schema.ts";

const defaultGames = [
  { name: "EA Sports FC 25" },
  { name: "EA Sports FC 26" },
  { name: "EA Sports FC 27" },
];

async function seed() {
  await db.insert(games).values(defaultGames).onConflictDoNothing();

  console.log("Database seeded successfully!");
}

seed().catch((error) => {
  console.error("Failed to seed database:", error);
  process.exit(1);
});

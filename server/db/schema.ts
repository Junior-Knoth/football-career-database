import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

export const games = sqliteTable("games", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  name: text("name").notNull().unique(),
});

export const saves = sqliteTable("saves", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  name: text("name").notNull(),
  gameId: integer("game_id")
    .notNull()
    .references(() => games.id, { onDelete: "restrict" }),
  status: text("status").notNull().$type<"active" | "finished" | "archived">(),
  current_season_id: integer("current_season_id"),
  managerName: text("manager_name").notNull(),
  managerBirthDate: text("manager_birth_date"),
  managerNationalityId: integer("manager_nationality_id").references(
    () => countries.id,
    { onDelete: "restrict" },
  ),
});

export const seasons = sqliteTable(
  "seasons",
  {
    id: integer("id").primaryKey({
      autoIncrement: true,
    }),
    saveId: integer("save_id")
      .notNull()
      .references(() => saves.id, { onDelete: "restrict" }),
    label: text("label").notNull(),
    startDate: text("start_date").notNull(),
    endDate: text("end_date").notNull(),
    orderIndex: integer("order_index").notNull(),
  },
  (table) => [
    unique("seasons_save_id_label_unique").on(table.saveId, table.label),
  ],
);

export const countries = sqliteTable("countries", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  name: text("name").notNull().unique(),
  flagCode: text("flag_code").notNull().unique(),
  shortCode: text("short_code").notNull().unique(),
});

export const teams = sqliteTable("teams", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  name: text("name").notNull(),
  shortName: text("short_name"),
  shortCode: text("short_code"),
  type: text("type").notNull().$type<"club" | "national">(),
  countryId: integer("country_id")
    .notNull()
    .references(() => countries.id, { onDelete: "restrict" }),
});

export const saveTeams = sqliteTable(
  "save_teams",
  {
    id: integer("id").primaryKey({
      autoIncrement: true,
    }),
    saveId: integer("save_id")
      .notNull()
      .references(() => saves.id, { onDelete: "restrict" }),
    teamId: integer("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "restrict" }),
  },
  (table) => [
    unique("save_teams_save_id_team_id_unique").on(table.saveId, table.teamId),
  ],
);

export const managerAssignments = sqliteTable("manager_assignments", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  saveId: integer("save_id")
    .notNull()
    .references(() => saves.id, { onDelete: "restrict" }),
  saveTeamId: integer("save_team_id")
    .notNull()
    .references(() => saveTeams.id, { onDelete: "restrict" }),
  startSeasonId: integer("start_season_id")
    .notNull()
    .references(() => seasons.id, { onDelete: "restrict" }),
  endSeasonId: integer("end_season_id").references(() => seasons.id, {
    onDelete: "restrict",
  }),
  startDate: text("start_date"),
  endDate: text("end_date"),
});

export const players = sqliteTable("players", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  name: text("name").notNull(),
  birthDate: text("birth_date").notNull(),
  nationalityId: integer("nationality_id")
    .notNull()
    .references(() => countries.id, { onDelete: "restrict" }),
  preferredFoot: text("preferred_foot")
    .notNull()
    .$type<"left" | "right" | "both">(),
  type: text("type")
    .notNull()
    .$type<"real" | "created" | "academy_generated" | "regen" | "other">(),
  heightCm: integer("height_cm").notNull(),
  weightKg: integer("weight_kg").notNull(),
});

export const savePlayers = sqliteTable(
  "save_players",
  {
    id: integer("id").primaryKey({
      autoIncrement: true,
    }),
    saveId: integer("save_id")
      .notNull()
      .references(() => saves.id, { onDelete: "restrict" }),
    playerId: integer("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "restrict" }),
  },
  (table) => [
    unique("save_players_save_id_player_id_unique").on(
      table.saveId,
      table.playerId,
    ),
  ],
);

export const playerSeasons = sqliteTable(
  "player_seasons",
  {
    id: integer("id").primaryKey({
      autoIncrement: true,
    }),
    savePlayerId: integer("save_player_id")
      .notNull()
      .references(() => savePlayers.id, { onDelete: "restrict" }),
    seasonId: integer("season_id")
      .notNull()
      .references(() => seasons.id, { onDelete: "restrict" }),
    saveTeam: integer("save_team_id").references(() => saveTeams.id, {
      onDelete: "restrict",
    }),
  },
  (table) => [
    unique("player_seasons_save_player_id_season_id_unique").on(
      table.savePlayerId,
      table.seasonId,
    ),
  ],
);

export const positions = sqliteTable("positions", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  key: text("key").notNull(),
  name: text("name").notNull(),
  category: text("category")
    .notNull()
    .$type<"goalkeeper" | "defender" | "midfielder" | "forward">(),
});

export const playerUpdates = sqliteTable("player_updates", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  savePlayerId: integer("save_player_id")
    .notNull()
    .references(() => savePlayers.id, { onDelete: "restrict" }),
  seasonId: integer("season_id")
    .notNull()
    .references(() => seasons.id, { onDelete: "restrict" }),
  effectiveDate: text("effective_date"),
  orderIndex: integer("order_index").notNull(),
  overall: integer("overall"),
  shirtNumber: integer("shirt_number"),
  shirtName: text("shirt_name"),
});

export const competitions = sqliteTable("competitions", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  name: text("name").notNull(),
  shortName: text("short_name"),
  shortCode: text("short_code"),
  countryId: integer("country_id").references(() => countries.id, {
    onDelete: "restrict",
  }),
  type: text("type")
    .notNull()
    .$type<"league" | "cup" | "continental" | "international" | "other">(),
  scope: text("scope")
    .notNull()
    .$type<"domestic" | "continental" | "international" | "other">(),
});

export const statType = sqliteTable("stat_types", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
});

export const playerSeasonStats = sqliteTable("player_season_stats", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  playerSeasonId: integer("player_season_id")
    .notNull()
    .references(() => playerSeasons.id, { onDelete: "restrict" }),
  statTypeId: integer("stat_type_id")
    .notNull()
    .references(() => statType.id, { onDelete: "restrict" }),
  competitionId: integer("competition_id").references(() => competitions.id, {
    onDelete: "restrict",
  }),
  value: integer("value").notNull(),
});

export const transfers = sqliteTable("transfers", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  savePlayerId: integer("save_player_id")
    .notNull()
    .references(() => savePlayers.id, { onDelete: "restrict" }),
  seasonId: integer("season_id")
    .notNull()
    .references(() => seasons.id, { onDelete: "restrict" }),
  fromSaveTeamId: integer("from_save_team_id").references(() => saveTeams.id, {
    onDelete: "restrict",
  }),
  toSaveTeamId: integer("to_save_team_id").references(() => saveTeams.id, {
    onDelete: "restrict",
  }),
  type: text("type")
    .notNull()
    .$type<"permanent" | "loan" | "loan_return" | "free" | "release">(),
  fee: integer("fee"),
  currency: text("currency").$default(() => "EUR"),
  eventDate: text("event_date").notNull(),
});

export const contracts = sqliteTable("contracts", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  savePlayerId: integer("save_player_id")
    .notNull()
    .references(() => savePlayers.id, { onDelete: "restrict" }),
  saveTeamId: integer("save_team_id")
    .notNull()
    .references(() => saveTeams.id, { onDelete: "restrict" }),
  startSeasonId: integer("start_season_id")
    .notNull()
    .references(() => seasons.id, { onDelete: "restrict" }),
  endSeasonId: integer("end_season_id")
    .notNull()
    .references(() => seasons.id, { onDelete: "restrict" }),
  weeklySalary: integer("weekly_salary").notNull(),
  currency: text("currency").$default(() => "EUR"),
  signedDate: text("signed_date"),
});

export const playerCareerEvents = sqliteTable("player_career_events", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  savePlayerId: integer("save_player_id")
    .notNull()
    .references(() => savePlayers.id, { onDelete: "restrict" }),
  seasonId: integer("season_id")
    .notNull()
    .references(() => seasons.id, { onDelete: "restrict" }),
  eventType: text("event_type")
    .notNull()
    .$type<
      | "club_debut"
      | "international_debut"
      | "captaincy"
      | "academy_promotion"
      | "retirement"
      | "milestone"
    >(),
  eventDate: text("event_date").notNull(),
  saveTeamId: integer("save_team_id").references(() => saveTeams.id, {
    onDelete: "restrict",
  }),
});

export const honours = sqliteTable("honours", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  name: text("name").notNull(),
  saveId: integer("save_id")
    .notNull()
    .references(() => saves.id, { onDelete: "restrict" }),
  seasonId: integer("season_id")
    .notNull()
    .references(() => seasons.id, { onDelete: "restrict" }),
  type: text("type")
    .notNull()
    .$type<
      "club_trophy" | "national_team_trophy" | "individual_award" | "other"
    >(),
  competitionId: integer("competition_id").references(() => competitions.id, {
    onDelete: "restrict",
  }),
  savePlayerId: integer("save_player_id").references(() => savePlayers.id, {
    onDelete: "restrict",
  }),
  saveTeamId: integer("save_team_id").references(() => saveTeams.id, {
    onDelete: "restrict",
  }),
});

export const playerSeasonPositions = sqliteTable("player_season_positions", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  playerSeasonId: integer("player_season_id")
    .notNull()
    .references(() => playerSeasons.id, { onDelete: "restrict" }),
  positionId: integer("position_id")
    .notNull()
    .references(() => positions.id, { onDelete: "restrict" }),

  priority: integer("priority").notNull(),
});

import {
  type AnySQLiteColumn,
  integer,
  real,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";

// -----------------------------------------------------------------------------
// Core
// -----------------------------------------------------------------------------

export const games = sqliteTable("games", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  name: text("name").notNull().unique(),
});

export const countries = sqliteTable("countries", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  name: text("name").notNull().unique(),
  flagCode: text("flag_code").notNull().unique(),
  shortCode: text("short_code").notNull().unique(),
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
  currentSeasonId: integer("current_season_id").references(
    (): AnySQLiteColumn => seasons.id,
    {
      onDelete: "set null",
    },
  ),
  managerName: text("manager_name").notNull(),
  managerBirthDate: text("manager_birth_date").notNull(),
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
      .references(() => saves.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    startDate: text("start_date").notNull(),
    endDate: text("end_date").notNull(),
    orderIndex: integer("order_index").notNull(),
  },
  (table) => [
    unique("seasons_save_id_label_unique").on(table.saveId, table.label),
    unique("seasons_save_id_order_index_unique").on(
      table.saveId,
      table.orderIndex,
    ),
  ],
);

// -----------------------------------------------------------------------------
// Teams / manager career
// -----------------------------------------------------------------------------

export const stadiums = sqliteTable("stadiums", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  name: text("name").notNull(),
  city: text("city"),
  countryId: integer("country_id").references(() => countries.id, {
    onDelete: "restrict",
  }),
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
      .references(() => saves.id, { onDelete: "cascade" }),
    teamId: integer("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "restrict" }),
    homeStadiumId: integer("home_stadium_id").references(() => stadiums.id, {
      onDelete: "set null",
    }),
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
    .references(() => saves.id, { onDelete: "cascade" }),
  saveTeamId: integer("save_team_id")
    .notNull()
    .references(() => saveTeams.id, { onDelete: "cascade" }),
  startSeasonId: integer("start_season_id")
    .notNull()
    .references(() => seasons.id, { onDelete: "cascade" }),
  endSeasonId: integer("end_season_id").references(() => seasons.id, {
    onDelete: "cascade",
  }),
  startDate: text("start_date"),
  endDate: text("end_date"),
});

// -----------------------------------------------------------------------------
// Players
// -----------------------------------------------------------------------------

export const positions = sqliteTable("positions", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  category: text("category")
    .notNull()
    .$type<"goalkeeper" | "defender" | "midfielder" | "forward">(),
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
      .references(() => saves.id, { onDelete: "cascade" }),
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
      .references(() => savePlayers.id, { onDelete: "cascade" }),
    seasonId: integer("season_id")
      .notNull()
      .references(() => seasons.id, { onDelete: "cascade" }),
  },
  (table) => [
    unique("player_seasons_save_player_id_season_id_unique").on(
      table.savePlayerId,
      table.seasonId,
    ),
  ],
);

// A player may represent more than one team in the same season.
// This handles January transfers, loans and overlapping club/national-team use.
export const playerTeamStints = sqliteTable(
  "player_team_stints",
  {
    id: integer("id").primaryKey({
      autoIncrement: true,
    }),
    playerSeasonId: integer("player_season_id")
      .notNull()
      .references(() => playerSeasons.id, { onDelete: "cascade" }),
    saveTeamId: integer("save_team_id").references(() => saveTeams.id, {
      onDelete: "set null",
    }),
    startDate: text("start_date"),
    endDate: text("end_date"),
    orderIndex: integer("order_index").notNull(),
  },
  (table) => [
    unique("player_team_stints_season_order_unique").on(
      table.playerSeasonId,
      table.orderIndex,
    ),
  ],
);

export const playerUpdates = sqliteTable(
  "player_updates",
  {
    id: integer("id").primaryKey({
      autoIncrement: true,
    }),
    playerSeasonId: integer("player_season_id")
      .notNull()
      .references(() => playerSeasons.id, { onDelete: "cascade" }),
    effectiveDate: text("effective_date"),
    orderIndex: integer("order_index").notNull(),
    overall: integer("overall"),
    shirtNumber: integer("shirt_number"),
    shirtName: text("shirt_name"),
  },
  (table) => [
    unique("player_updates_season_order_unique").on(
      table.playerSeasonId,
      table.orderIndex,
    ),
  ],
);

export const playerSeasonPositions = sqliteTable(
  "player_season_positions",
  {
    id: integer("id").primaryKey({
      autoIncrement: true,
    }),
    playerSeasonId: integer("player_season_id")
      .notNull()
      .references(() => playerSeasons.id, { onDelete: "cascade" }),
    positionId: integer("position_id")
      .notNull()
      .references(() => positions.id, { onDelete: "restrict" }),
    priority: integer("priority").notNull(),
  },
  (table) => [
    unique("player_season_positions_position_unique").on(
      table.playerSeasonId,
      table.positionId,
    ),
    unique("player_season_positions_priority_unique").on(
      table.playerSeasonId,
      table.priority,
    ),
  ],
);

// Optional deep-detail attributes (pace, finishing, passing, etc.).
export const playerAttributeTypes = sqliteTable("player_attribute_types", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  category: text("category"),
});

export const playerAttributeValues = sqliteTable(
  "player_attribute_values",
  {
    id: integer("id").primaryKey({
      autoIncrement: true,
    }),
    playerUpdateId: integer("player_update_id")
      .notNull()
      .references(() => playerUpdates.id, { onDelete: "cascade" }),
    attributeTypeId: integer("attribute_type_id")
      .notNull()
      .references(() => playerAttributeTypes.id, { onDelete: "restrict" }),
    value: integer("value").notNull(),
  },
  (table) => [
    unique("player_attribute_values_update_type_unique").on(
      table.playerUpdateId,
      table.attributeTypeId,
    ),
  ],
);

export const playerAbsences = sqliteTable("player_absences", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  savePlayerId: integer("save_player_id")
    .notNull()
    .references(() => savePlayers.id, { onDelete: "cascade" }),
  type: text("type").notNull().$type<"injury" | "suspension" | "other">(),
  name: text("name"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  startSeasonId: integer("start_season_id").references(() => seasons.id, {
    onDelete: "set null",
  }),
  endSeasonId: integer("end_season_id").references(() => seasons.id, {
    onDelete: "set null",
  }),
  notes: text("notes"),
});

// -----------------------------------------------------------------------------
// Competitions
// -----------------------------------------------------------------------------

export const competitions = sqliteTable("competitions", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  name: text("name").notNull(),
  shortName: text("short_name"),
  shortCode: text("short_code"),
  participantType: text("participant_type")
    .notNull()
    .$type<"club" | "national">(),
  type: text("type").notNull().$type<"league" | "cup" | "hybrid" | "other">(),
  scope: text("scope")
    .notNull()
    .$type<"domestic" | "continental" | "world" | "other">(),
  countryId: integer("country_id").references(() => countries.id, {
    onDelete: "restrict",
  }),
});

export const competitionEditions = sqliteTable(
  "competition_editions",
  {
    id: integer("id").primaryKey({
      autoIncrement: true,
    }),
    saveId: integer("save_id")
      .notNull()
      .references(() => saves.id, { onDelete: "cascade" }),
    competitionId: integer("competition_id")
      .notNull()
      .references(() => competitions.id, { onDelete: "restrict" }),
    seasonId: integer("season_id").references(() => seasons.id, {
      onDelete: "set null",
    }),
    label: text("label").notNull(),
    startDate: text("start_date"),
    endDate: text("end_date"),
  },
  (table) => [
    unique("competition_editions_save_competition_label_unique").on(
      table.saveId,
      table.competitionId,
      table.label,
    ),
  ],
);

export const competitionStages = sqliteTable(
  "competition_stages",
  {
    id: integer("id").primaryKey({
      autoIncrement: true,
    }),
    competitionEditionId: integer("competition_edition_id")
      .notNull()
      .references(() => competitionEditions.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    orderIndex: integer("order_index").notNull(),
    type: text("type").notNull().$type<"league" | "group" | "knockout" | "other">(),
    matchFormat: text("match_format").$type<
      "single" | "two_legged" | "round_robin" | "custom"
    >(),
    drawPolicy: text("draw_policy")
      .notNull()
      .$type<"allowed" | "extra_time_then_penalties" | "penalties">(),
    groupCount: integer("group_count"),
    teamsPerGroup: integer("teams_per_group"),
    advancingTeamsPerGroup: integer("advancing_teams_per_group"),
    matchesPerTeam: integer("matches_per_team"),
    pointsForWin: integer("points_for_win").default(3),
    pointsForDraw: integer("points_for_draw").default(1),
    pointsForLoss: integer("points_for_loss").default(0),
    awayGoalsRule: integer("away_goals_rule", { mode: "boolean" })
      .notNull()
      .default(false),
  },
  (table) => [
    unique("competition_stages_edition_order_unique").on(
      table.competitionEditionId,
      table.orderIndex,
    ),
  ],
);

export const competitionParticipants = sqliteTable(
  "competition_participants",
  {
    id: integer("id").primaryKey({
      autoIncrement: true,
    }),
    competitionEditionId: integer("competition_edition_id")
      .notNull()
      .references(() => competitionEditions.id, { onDelete: "cascade" }),
    saveTeamId: integer("save_team_id")
      .notNull()
      .references(() => saveTeams.id, { onDelete: "cascade" }),
  },
  (table) => [
    unique("competition_participants_edition_team_unique").on(
      table.competitionEditionId,
      table.saveTeamId,
    ),
  ],
);

export const competitionStageGroups = sqliteTable(
  "competition_stage_groups",
  {
    id: integer("id").primaryKey({
      autoIncrement: true,
    }),
    competitionStageId: integer("competition_stage_id")
      .notNull()
      .references(() => competitionStages.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    orderIndex: integer("order_index").notNull(),
  },
  (table) => [
    unique("competition_stage_groups_stage_order_unique").on(
      table.competitionStageId,
      table.orderIndex,
    ),
  ],
);

export const competitionStageGroupTeams = sqliteTable(
  "competition_stage_group_teams",
  {
    id: integer("id").primaryKey({
      autoIncrement: true,
    }),
    competitionStageGroupId: integer("competition_stage_group_id")
      .notNull()
      .references(() => competitionStageGroups.id, { onDelete: "cascade" }),
    competitionParticipantId: integer("competition_participant_id")
      .notNull()
      .references(() => competitionParticipants.id, { onDelete: "cascade" }),
  },
  (table) => [
    unique("competition_stage_group_teams_group_participant_unique").on(
      table.competitionStageGroupId,
      table.competitionParticipantId,
    ),
  ],
);

// Optional summary standings. These allow league/group tracking without
// requiring every match in the competition to be registered.
export const competitionStageTeamStats = sqliteTable(
  "competition_stage_team_stats",
  {
    id: integer("id").primaryKey({
      autoIncrement: true,
    }),
    competitionStageId: integer("competition_stage_id")
      .notNull()
      .references(() => competitionStages.id, { onDelete: "cascade" }),
    competitionParticipantId: integer("competition_participant_id")
      .notNull()
      .references(() => competitionParticipants.id, { onDelete: "cascade" }),
    competitionStageGroupId: integer("competition_stage_group_id").references(
      () => competitionStageGroups.id,
      { onDelete: "set null" },
    ),
    position: integer("position"),
    played: integer("played"),
    wins: integer("wins"),
    draws: integer("draws"),
    losses: integer("losses"),
    goalsFor: integer("goals_for"),
    goalsAgainst: integer("goals_against"),
    points: integer("points"),
  },
  (table) => [
    unique("competition_stage_team_stats_stage_participant_unique").on(
      table.competitionStageId,
      table.competitionParticipantId,
    ),
  ],
);

// Titles that existed before the detailed history tracked in this save.
export const teamCompetitionHistory = sqliteTable(
  "team_competition_history",
  {
    id: integer("id").primaryKey({
      autoIncrement: true,
    }),
    saveTeamId: integer("save_team_id")
      .notNull()
      .references(() => saveTeams.id, { onDelete: "cascade" }),
    competitionId: integer("competition_id")
      .notNull()
      .references(() => competitions.id, { onDelete: "restrict" }),
    baselineTitles: integer("baseline_titles").notNull().default(0),
  },
  (table) => [
    unique("team_competition_history_team_competition_unique").on(
      table.saveTeamId,
      table.competitionId,
    ),
  ],
);

// -----------------------------------------------------------------------------
// Player statistics
// -----------------------------------------------------------------------------

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
    .references(() => playerSeasons.id, { onDelete: "cascade" }),
  statTypeId: integer("stat_type_id")
    .notNull()
    .references(() => statType.id, { onDelete: "restrict" }),
  competitionEditionId: integer("competition_edition_id").references(
    () => competitionEditions.id,
    { onDelete: "set null" },
  ),
  playerTeamStintId: integer("player_team_stint_id").references(
    () => playerTeamStints.id,
    { onDelete: "set null" },
  ),
  value: integer("value").notNull(),
});

// -----------------------------------------------------------------------------
// International windows / call-ups
// -----------------------------------------------------------------------------

export const internationalWindows = sqliteTable("international_windows", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  saveId: integer("save_id")
    .notNull()
    .references(() => saves.id, { onDelete: "cascade" }),
  nationalSaveTeamId: integer("national_save_team_id")
    .notNull()
    .references(() => saveTeams.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
});

export const nationalTeamCallups = sqliteTable("national_team_callups", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  saveId: integer("save_id")
    .notNull()
    .references(() => saves.id, { onDelete: "cascade" }),
  nationalSaveTeamId: integer("national_save_team_id")
    .notNull()
    .references(() => saveTeams.id, { onDelete: "cascade" }),
  internationalWindowId: integer("international_window_id").references(
    () => internationalWindows.id,
    { onDelete: "set null" },
  ),
  competitionEditionId: integer("competition_edition_id").references(
    () => competitionEditions.id,
    { onDelete: "set null" },
  ),
  name: text("name").notNull(),
  announcedDate: text("announced_date"),
  startDate: text("start_date"),
  endDate: text("end_date"),
});

export const nationalTeamCallupPlayers = sqliteTable(
  "national_team_callup_players",
  {
    id: integer("id").primaryKey({
      autoIncrement: true,
    }),
    nationalTeamCallupId: integer("national_team_callup_id")
      .notNull()
      .references(() => nationalTeamCallups.id, { onDelete: "cascade" }),
    savePlayerId: integer("save_player_id").references(() => savePlayers.id, {
      onDelete: "set null",
    }),
    playerName: text("player_name").notNull(),
    squadNumber: integer("squad_number"),
    status: text("status")
      .notNull()
      .$type<"selected" | "replacement" | "withdrawn">()
      .default("selected"),
  },
);

// -----------------------------------------------------------------------------
// Matches
// -----------------------------------------------------------------------------

export const matchTies = sqliteTable(
  "match_ties",
  {
    id: integer("id").primaryKey({
      autoIncrement: true,
    }),
    competitionStageId: integer("competition_stage_id")
      .notNull()
      .references(() => competitionStages.id, { onDelete: "cascade" }),
    label: text("label"),
    orderIndex: integer("order_index").notNull(),
  },
  (table) => [
    unique("match_ties_stage_order_unique").on(
      table.competitionStageId,
      table.orderIndex,
    ),
  ],
);

export const matches = sqliteTable("matches", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  saveId: integer("save_id")
    .notNull()
    .references(() => saves.id, { onDelete: "cascade" }),
  seasonId: integer("season_id").references(() => seasons.id, {
    onDelete: "set null",
  }),
  competitionEditionId: integer("competition_edition_id").references(
    () => competitionEditions.id,
    { onDelete: "set null" },
  ),
  competitionStageId: integer("competition_stage_id").references(
    () => competitionStages.id,
    { onDelete: "set null" },
  ),
  matchTieId: integer("match_tie_id").references(() => matchTies.id, {
    onDelete: "set null",
  }),
  internationalWindowId: integer("international_window_id").references(
    () => internationalWindows.id,
    { onDelete: "set null" },
  ),
  homeSaveTeamId: integer("home_save_team_id").references(() => saveTeams.id, {
    onDelete: "set null",
  }),
  awaySaveTeamId: integer("away_save_team_id").references(() => saveTeams.id, {
    onDelete: "set null",
  }),
  // Name snapshots also allow old/imported matches to remain understandable
  // if the structured relation is absent later.
  homeTeamName: text("home_team_name").notNull(),
  awayTeamName: text("away_team_name").notNull(),
  stadiumId: integer("stadium_id").references(() => stadiums.id, {
    onDelete: "set null",
  }),
  status: text("status")
    .notNull()
    .$type<"scheduled" | "played" | "postponed" | "cancelled">()
    .default("scheduled"),
  matchDate: text("match_date"),
  orderIndex: integer("order_index"),
  legNumber: integer("leg_number"),
  homeScore90: integer("home_score_90"),
  awayScore90: integer("away_score_90"),
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  wentToExtraTime: integer("went_to_extra_time", { mode: "boolean" })
    .notNull()
    .default(false),
  homePenaltyScore: integer("home_penalty_score"),
  awayPenaltyScore: integer("away_penalty_score"),
  notes: text("notes"),
});

export const matchPlayerAppearances = sqliteTable(
  "match_player_appearances",
  {
    id: integer("id").primaryKey({
      autoIncrement: true,
    }),
    matchId: integer("match_id")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    saveTeamId: integer("save_team_id").references(() => saveTeams.id, {
      onDelete: "set null",
    }),
    savePlayerId: integer("save_player_id").references(() => savePlayers.id, {
      onDelete: "set null",
    }),
    // Kept even for structured players as a searchable historical snapshot.
    playerName: text("player_name").notNull(),
    status: text("status")
      .notNull()
      .$type<"starter" | "substitute" | "unused">(),
    positionId: integer("position_id").references(() => positions.id, {
      onDelete: "set null",
    }),
    shirtNumber: integer("shirt_number"),
    minutesPlayed: integer("minutes_played"),
    enteredMinute: integer("entered_minute"),
    exitedMinute: integer("exited_minute"),
    rating: real("rating"),
    isCaptain: integer("is_captain", { mode: "boolean" })
      .notNull()
      .default(false),
    isManOfTheMatch: integer("is_man_of_the_match", { mode: "boolean" })
      .notNull()
      .default(false),
  },
);

export const matchEvents = sqliteTable("match_events", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  matchId: integer("match_id")
    .notNull()
    .references(() => matches.id, { onDelete: "cascade" }),
  saveTeamId: integer("save_team_id").references(() => saveTeams.id, {
    onDelete: "set null",
  }),
  savePlayerId: integer("save_player_id").references(() => savePlayers.id, {
    onDelete: "set null",
  }),
  playerName: text("player_name"),
  assistSavePlayerId: integer("assist_save_player_id").references(
    () => savePlayers.id,
    { onDelete: "set null" },
  ),
  assistPlayerName: text("assist_player_name"),
  type: text("type")
    .notNull()
    .$type<
      | "goal"
      | "own_goal"
      | "yellow_card"
      | "red_card"
      | "substitution"
      | "other"
    >(),
  minute: integer("minute"),
  addedTime: integer("added_time"),
  orderIndex: integer("order_index"),
  notes: text("notes"),
});

export const penaltyShootoutKicks = sqliteTable(
  "penalty_shootout_kicks",
  {
    id: integer("id").primaryKey({
      autoIncrement: true,
    }),
    matchId: integer("match_id")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    saveTeamId: integer("save_team_id").references(() => saveTeams.id, {
      onDelete: "set null",
    }),
    savePlayerId: integer("save_player_id").references(() => savePlayers.id, {
      onDelete: "set null",
    }),
    playerName: text("player_name"),
    orderIndex: integer("order_index").notNull(),
    result: text("result").notNull().$type<"scored" | "saved" | "missed">(),
  },
  (table) => [
    unique("penalty_shootout_kicks_match_order_unique").on(
      table.matchId,
      table.orderIndex,
    ),
  ],
);

// -----------------------------------------------------------------------------
// Career history
// -----------------------------------------------------------------------------

export const transfers = sqliteTable("transfers", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  savePlayerId: integer("save_player_id")
    .notNull()
    .references(() => savePlayers.id, { onDelete: "cascade" }),
  seasonId: integer("season_id")
    .notNull()
    .references(() => seasons.id, { onDelete: "cascade" }),
  fromSaveTeamId: integer("from_save_team_id").references(() => saveTeams.id, {
    onDelete: "set null",
  }),
  toSaveTeamId: integer("to_save_team_id").references(() => saveTeams.id, {
    onDelete: "set null",
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
    .references(() => savePlayers.id, { onDelete: "cascade" }),
  saveTeamId: integer("save_team_id").references(() => saveTeams.id, {
    onDelete: "set null",
  }),
  startSeasonId: integer("start_season_id")
    .notNull()
    .references(() => seasons.id, { onDelete: "cascade" }),
  endSeasonId: integer("end_season_id").references(() => seasons.id, {
    onDelete: "cascade",
  }),
  weeklySalary: integer("weekly_salary"),
  currency: text("currency").$default(() => "EUR"),
  signedDate: text("signed_date"),
});

export const playerCareerEvents = sqliteTable("player_career_events", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  savePlayerId: integer("save_player_id")
    .notNull()
    .references(() => savePlayers.id, { onDelete: "cascade" }),
  seasonId: integer("season_id")
    .notNull()
    .references(() => seasons.id, { onDelete: "cascade" }),
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
    onDelete: "set null",
  }),
  notes: text("notes"),
});

export const honours = sqliteTable("honours", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  name: text("name").notNull(),
  saveId: integer("save_id")
    .notNull()
    .references(() => saves.id, { onDelete: "cascade" }),
  seasonId: integer("season_id")
    .notNull()
    .references(() => seasons.id, { onDelete: "cascade" }),
  type: text("type")
    .notNull()
    .$type<
      "club_trophy" | "national_team_trophy" | "individual_award" | "other"
    >(),
  competitionId: integer("competition_id").references(() => competitions.id, {
    onDelete: "restrict",
  }),
  competitionEditionId: integer("competition_edition_id").references(
    () => competitionEditions.id,
    { onDelete: "set null" },
  ),
  savePlayerId: integer("save_player_id").references(() => savePlayers.id, {
    onDelete: "set null",
  }),
  saveTeamId: integer("save_team_id").references(() => saveTeams.id, {
    onDelete: "set null",
  }),
});

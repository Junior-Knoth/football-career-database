CREATE TABLE `competitions` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`short_name` text,
	`short_code` text,
	`country_id` integer,
	`type` text NOT NULL,
	`scope` text NOT NULL,
	CONSTRAINT `fk_competitions_country_id_countries_id_fk` FOREIGN KEY (`country_id`) REFERENCES `countries`(`id`) ON DELETE RESTRICT
);
--> statement-breakpoint
CREATE TABLE `contracts` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`save_player_id` integer NOT NULL,
	`save_team_id` integer NOT NULL,
	`start_season_id` integer NOT NULL,
	`end_season_id` integer NOT NULL,
	`weekly_salary` integer NOT NULL,
	`currency` text,
	`signed_date` text,
	CONSTRAINT `fk_contracts_save_player_id_save_players_id_fk` FOREIGN KEY (`save_player_id`) REFERENCES `save_players`(`id`) ON DELETE RESTRICT,
	CONSTRAINT `fk_contracts_save_team_id_save_teams_id_fk` FOREIGN KEY (`save_team_id`) REFERENCES `save_teams`(`id`) ON DELETE RESTRICT,
	CONSTRAINT `fk_contracts_start_season_id_seasons_id_fk` FOREIGN KEY (`start_season_id`) REFERENCES `seasons`(`id`) ON DELETE RESTRICT,
	CONSTRAINT `fk_contracts_end_season_id_seasons_id_fk` FOREIGN KEY (`end_season_id`) REFERENCES `seasons`(`id`) ON DELETE RESTRICT
);
--> statement-breakpoint
CREATE TABLE `countries` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL UNIQUE,
	`flag_code` text NOT NULL UNIQUE,
	`short_code` text NOT NULL UNIQUE
);
--> statement-breakpoint
CREATE TABLE `games` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL UNIQUE
);
--> statement-breakpoint
CREATE TABLE `honours` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`save_id` integer NOT NULL,
	`season_id` integer NOT NULL,
	`type` text NOT NULL,
	`competition_id` integer,
	`save_player_id` integer,
	`save_team_id` integer,
	CONSTRAINT `fk_honours_save_id_saves_id_fk` FOREIGN KEY (`save_id`) REFERENCES `saves`(`id`) ON DELETE RESTRICT,
	CONSTRAINT `fk_honours_season_id_seasons_id_fk` FOREIGN KEY (`season_id`) REFERENCES `seasons`(`id`) ON DELETE RESTRICT,
	CONSTRAINT `fk_honours_competition_id_competitions_id_fk` FOREIGN KEY (`competition_id`) REFERENCES `competitions`(`id`) ON DELETE RESTRICT,
	CONSTRAINT `fk_honours_save_player_id_save_players_id_fk` FOREIGN KEY (`save_player_id`) REFERENCES `save_players`(`id`) ON DELETE RESTRICT,
	CONSTRAINT `fk_honours_save_team_id_save_teams_id_fk` FOREIGN KEY (`save_team_id`) REFERENCES `save_teams`(`id`) ON DELETE RESTRICT
);
--> statement-breakpoint
CREATE TABLE `manager_assignments` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`save_id` integer NOT NULL,
	`save_team_id` integer NOT NULL,
	`start_season_id` integer NOT NULL,
	`end_season_id` integer,
	`start_date` text,
	`end_date` text,
	CONSTRAINT `fk_manager_assignments_save_id_saves_id_fk` FOREIGN KEY (`save_id`) REFERENCES `saves`(`id`) ON DELETE RESTRICT,
	CONSTRAINT `fk_manager_assignments_save_team_id_save_teams_id_fk` FOREIGN KEY (`save_team_id`) REFERENCES `save_teams`(`id`) ON DELETE RESTRICT,
	CONSTRAINT `fk_manager_assignments_start_season_id_seasons_id_fk` FOREIGN KEY (`start_season_id`) REFERENCES `seasons`(`id`) ON DELETE RESTRICT,
	CONSTRAINT `fk_manager_assignments_end_season_id_seasons_id_fk` FOREIGN KEY (`end_season_id`) REFERENCES `seasons`(`id`) ON DELETE RESTRICT
);
--> statement-breakpoint
CREATE TABLE `player_career_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`save_player_id` integer NOT NULL,
	`season_id` integer NOT NULL,
	`event_type` text NOT NULL,
	`event_date` text NOT NULL,
	`save_team_id` integer,
	CONSTRAINT `fk_player_career_events_save_player_id_save_players_id_fk` FOREIGN KEY (`save_player_id`) REFERENCES `save_players`(`id`) ON DELETE RESTRICT,
	CONSTRAINT `fk_player_career_events_season_id_seasons_id_fk` FOREIGN KEY (`season_id`) REFERENCES `seasons`(`id`) ON DELETE RESTRICT,
	CONSTRAINT `fk_player_career_events_save_team_id_save_teams_id_fk` FOREIGN KEY (`save_team_id`) REFERENCES `save_teams`(`id`) ON DELETE RESTRICT
);
--> statement-breakpoint
CREATE TABLE `player_season_positions` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`player_season_id` integer NOT NULL,
	`position_id` integer NOT NULL,
	`priority` integer NOT NULL,
	CONSTRAINT `fk_player_season_positions_player_season_id_player_seasons_id_fk` FOREIGN KEY (`player_season_id`) REFERENCES `player_seasons`(`id`) ON DELETE RESTRICT,
	CONSTRAINT `fk_player_season_positions_position_id_positions_id_fk` FOREIGN KEY (`position_id`) REFERENCES `positions`(`id`) ON DELETE RESTRICT
);
--> statement-breakpoint
CREATE TABLE `player_season_stats` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`player_season_id` integer NOT NULL,
	`stat_type_id` integer NOT NULL,
	`competition_id` integer,
	`value` integer NOT NULL,
	CONSTRAINT `fk_player_season_stats_player_season_id_player_seasons_id_fk` FOREIGN KEY (`player_season_id`) REFERENCES `player_seasons`(`id`) ON DELETE RESTRICT,
	CONSTRAINT `fk_player_season_stats_stat_type_id_stat_types_id_fk` FOREIGN KEY (`stat_type_id`) REFERENCES `stat_types`(`id`) ON DELETE RESTRICT,
	CONSTRAINT `fk_player_season_stats_competition_id_competitions_id_fk` FOREIGN KEY (`competition_id`) REFERENCES `competitions`(`id`) ON DELETE RESTRICT
);
--> statement-breakpoint
CREATE TABLE `player_seasons` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`save_player_id` integer NOT NULL,
	`season_id` integer NOT NULL,
	`save_team_id` integer,
	CONSTRAINT `fk_player_seasons_save_player_id_save_players_id_fk` FOREIGN KEY (`save_player_id`) REFERENCES `save_players`(`id`) ON DELETE RESTRICT,
	CONSTRAINT `fk_player_seasons_season_id_seasons_id_fk` FOREIGN KEY (`season_id`) REFERENCES `seasons`(`id`) ON DELETE RESTRICT,
	CONSTRAINT `fk_player_seasons_save_team_id_save_teams_id_fk` FOREIGN KEY (`save_team_id`) REFERENCES `save_teams`(`id`) ON DELETE RESTRICT,
	CONSTRAINT `player_seasons_save_player_id_season_id_unique` UNIQUE(`save_player_id`,`season_id`)
);
--> statement-breakpoint
CREATE TABLE `player_updates` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`save_player_id` integer NOT NULL,
	`season_id` integer NOT NULL,
	`effective_date` text,
	`order_index` integer NOT NULL,
	`overall` integer,
	`shirt_number` integer,
	`shirt_name` text,
	CONSTRAINT `fk_player_updates_save_player_id_save_players_id_fk` FOREIGN KEY (`save_player_id`) REFERENCES `save_players`(`id`) ON DELETE RESTRICT,
	CONSTRAINT `fk_player_updates_season_id_seasons_id_fk` FOREIGN KEY (`season_id`) REFERENCES `seasons`(`id`) ON DELETE RESTRICT
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`birth_date` text NOT NULL,
	`nationality_id` integer NOT NULL,
	`preferred_foot` text NOT NULL,
	`type` text NOT NULL,
	`height_cm` integer NOT NULL,
	`weight_kg` integer NOT NULL,
	CONSTRAINT `fk_players_nationality_id_countries_id_fk` FOREIGN KEY (`nationality_id`) REFERENCES `countries`(`id`) ON DELETE RESTRICT
);
--> statement-breakpoint
CREATE TABLE `positions` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`key` text NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `save_players` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`save_id` integer NOT NULL,
	`player_id` integer NOT NULL,
	CONSTRAINT `fk_save_players_save_id_saves_id_fk` FOREIGN KEY (`save_id`) REFERENCES `saves`(`id`) ON DELETE RESTRICT,
	CONSTRAINT `fk_save_players_player_id_players_id_fk` FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON DELETE RESTRICT,
	CONSTRAINT `save_players_save_id_player_id_unique` UNIQUE(`save_id`,`player_id`)
);
--> statement-breakpoint
CREATE TABLE `save_teams` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`save_id` integer NOT NULL,
	`team_id` integer NOT NULL,
	CONSTRAINT `fk_save_teams_save_id_saves_id_fk` FOREIGN KEY (`save_id`) REFERENCES `saves`(`id`) ON DELETE RESTRICT,
	CONSTRAINT `fk_save_teams_team_id_teams_id_fk` FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE RESTRICT,
	CONSTRAINT `save_teams_save_id_team_id_unique` UNIQUE(`save_id`,`team_id`)
);
--> statement-breakpoint
CREATE TABLE `saves` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`game_id` integer NOT NULL,
	`status` text NOT NULL,
	`current_season_id` integer,
	`manager_name` text NOT NULL,
	`manager_birth_date` text,
	`manager_nationality_id` integer,
	CONSTRAINT `fk_saves_game_id_games_id_fk` FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON DELETE RESTRICT,
	CONSTRAINT `fk_saves_manager_nationality_id_countries_id_fk` FOREIGN KEY (`manager_nationality_id`) REFERENCES `countries`(`id`) ON DELETE RESTRICT
);
--> statement-breakpoint
CREATE TABLE `seasons` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`save_id` integer NOT NULL,
	`label` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`order_index` integer NOT NULL,
	CONSTRAINT `fk_seasons_save_id_saves_id_fk` FOREIGN KEY (`save_id`) REFERENCES `saves`(`id`) ON DELETE RESTRICT,
	CONSTRAINT `seasons_save_id_label_unique` UNIQUE(`save_id`,`label`)
);
--> statement-breakpoint
CREATE TABLE `stat_types` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`key` text NOT NULL UNIQUE,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`short_name` text,
	`short_code` text,
	`type` text NOT NULL,
	`country_id` integer NOT NULL,
	CONSTRAINT `fk_teams_country_id_countries_id_fk` FOREIGN KEY (`country_id`) REFERENCES `countries`(`id`) ON DELETE RESTRICT
);
--> statement-breakpoint
CREATE TABLE `transfers` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`save_player_id` integer NOT NULL,
	`season_id` integer NOT NULL,
	`from_save_team_id` integer,
	`to_save_team_id` integer,
	`type` text NOT NULL,
	`fee` integer,
	`currency` text,
	`event_date` text NOT NULL,
	CONSTRAINT `fk_transfers_save_player_id_save_players_id_fk` FOREIGN KEY (`save_player_id`) REFERENCES `save_players`(`id`) ON DELETE RESTRICT,
	CONSTRAINT `fk_transfers_season_id_seasons_id_fk` FOREIGN KEY (`season_id`) REFERENCES `seasons`(`id`) ON DELETE RESTRICT,
	CONSTRAINT `fk_transfers_from_save_team_id_save_teams_id_fk` FOREIGN KEY (`from_save_team_id`) REFERENCES `save_teams`(`id`) ON DELETE RESTRICT,
	CONSTRAINT `fk_transfers_to_save_team_id_save_teams_id_fk` FOREIGN KEY (`to_save_team_id`) REFERENCES `save_teams`(`id`) ON DELETE RESTRICT
);

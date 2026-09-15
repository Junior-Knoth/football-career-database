PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_saves` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`game_id` integer NOT NULL,
	`status` text NOT NULL,
	`current_season_id` integer,
	`manager_name` text NOT NULL,
	`manager_birth_date` text NOT NULL,
	`manager_nationality_id` integer,
	CONSTRAINT `fk_saves_game_id_games_id_fk` FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON DELETE RESTRICT,
	CONSTRAINT `fk_saves_current_season_id_seasons_id_fk` FOREIGN KEY (`current_season_id`) REFERENCES `seasons`(`id`) ON DELETE SET NULL,
	CONSTRAINT `fk_saves_manager_nationality_id_countries_id_fk` FOREIGN KEY (`manager_nationality_id`) REFERENCES `countries`(`id`) ON DELETE RESTRICT
);
--> statement-breakpoint
INSERT INTO `__new_saves`(`id`, `name`, `game_id`, `status`, `current_season_id`, `manager_name`, `manager_birth_date`, `manager_nationality_id`) SELECT `id`, `name`, `game_id`, `status`, `current_season_id`, `manager_name`, `manager_birth_date`, `manager_nationality_id` FROM `saves`;--> statement-breakpoint
DROP TABLE `saves`;--> statement-breakpoint
ALTER TABLE `__new_saves` RENAME TO `saves`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_contracts` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`save_player_id` integer NOT NULL,
	`save_team_id` integer NOT NULL,
	`start_season_id` integer NOT NULL,
	`end_season_id` integer NOT NULL,
	`weekly_salary` integer NOT NULL,
	`currency` text,
	`signed_date` text,
	CONSTRAINT `fk_contracts_save_player_id_save_players_id_fk` FOREIGN KEY (`save_player_id`) REFERENCES `save_players`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_contracts_save_team_id_save_teams_id_fk` FOREIGN KEY (`save_team_id`) REFERENCES `save_teams`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_contracts_start_season_id_seasons_id_fk` FOREIGN KEY (`start_season_id`) REFERENCES `seasons`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_contracts_end_season_id_seasons_id_fk` FOREIGN KEY (`end_season_id`) REFERENCES `seasons`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_contracts`(`id`, `save_player_id`, `save_team_id`, `start_season_id`, `end_season_id`, `weekly_salary`, `currency`, `signed_date`) SELECT `id`, `save_player_id`, `save_team_id`, `start_season_id`, `end_season_id`, `weekly_salary`, `currency`, `signed_date` FROM `contracts`;--> statement-breakpoint
DROP TABLE `contracts`;--> statement-breakpoint
ALTER TABLE `__new_contracts` RENAME TO `contracts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_honours` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`save_id` integer NOT NULL,
	`season_id` integer NOT NULL,
	`type` text NOT NULL,
	`competition_id` integer,
	`save_player_id` integer,
	`save_team_id` integer,
	CONSTRAINT `fk_honours_save_id_saves_id_fk` FOREIGN KEY (`save_id`) REFERENCES `saves`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_honours_season_id_seasons_id_fk` FOREIGN KEY (`season_id`) REFERENCES `seasons`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_honours_competition_id_competitions_id_fk` FOREIGN KEY (`competition_id`) REFERENCES `competitions`(`id`) ON DELETE RESTRICT,
	CONSTRAINT `fk_honours_save_player_id_save_players_id_fk` FOREIGN KEY (`save_player_id`) REFERENCES `save_players`(`id`) ON DELETE SET NULL,
	CONSTRAINT `fk_honours_save_team_id_save_teams_id_fk` FOREIGN KEY (`save_team_id`) REFERENCES `save_teams`(`id`) ON DELETE SET NULL
);
--> statement-breakpoint
INSERT INTO `__new_honours`(`id`, `name`, `save_id`, `season_id`, `type`, `competition_id`, `save_player_id`, `save_team_id`) SELECT `id`, `name`, `save_id`, `season_id`, `type`, `competition_id`, `save_player_id`, `save_team_id` FROM `honours`;--> statement-breakpoint
DROP TABLE `honours`;--> statement-breakpoint
ALTER TABLE `__new_honours` RENAME TO `honours`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_manager_assignments` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`save_id` integer NOT NULL,
	`save_team_id` integer NOT NULL,
	`start_season_id` integer NOT NULL,
	`end_season_id` integer,
	`start_date` text,
	`end_date` text,
	CONSTRAINT `fk_manager_assignments_save_id_saves_id_fk` FOREIGN KEY (`save_id`) REFERENCES `saves`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_manager_assignments_save_team_id_save_teams_id_fk` FOREIGN KEY (`save_team_id`) REFERENCES `save_teams`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_manager_assignments_start_season_id_seasons_id_fk` FOREIGN KEY (`start_season_id`) REFERENCES `seasons`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_manager_assignments_end_season_id_seasons_id_fk` FOREIGN KEY (`end_season_id`) REFERENCES `seasons`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_manager_assignments`(`id`, `save_id`, `save_team_id`, `start_season_id`, `end_season_id`, `start_date`, `end_date`) SELECT `id`, `save_id`, `save_team_id`, `start_season_id`, `end_season_id`, `start_date`, `end_date` FROM `manager_assignments`;--> statement-breakpoint
DROP TABLE `manager_assignments`;--> statement-breakpoint
ALTER TABLE `__new_manager_assignments` RENAME TO `manager_assignments`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_player_career_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`save_player_id` integer NOT NULL,
	`season_id` integer NOT NULL,
	`event_type` text NOT NULL,
	`event_date` text NOT NULL,
	`save_team_id` integer,
	CONSTRAINT `fk_player_career_events_save_player_id_save_players_id_fk` FOREIGN KEY (`save_player_id`) REFERENCES `save_players`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_player_career_events_season_id_seasons_id_fk` FOREIGN KEY (`season_id`) REFERENCES `seasons`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_player_career_events_save_team_id_save_teams_id_fk` FOREIGN KEY (`save_team_id`) REFERENCES `save_teams`(`id`) ON DELETE SET NULL
);
--> statement-breakpoint
INSERT INTO `__new_player_career_events`(`id`, `save_player_id`, `season_id`, `event_type`, `event_date`, `save_team_id`) SELECT `id`, `save_player_id`, `season_id`, `event_type`, `event_date`, `save_team_id` FROM `player_career_events`;--> statement-breakpoint
DROP TABLE `player_career_events`;--> statement-breakpoint
ALTER TABLE `__new_player_career_events` RENAME TO `player_career_events`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_player_season_positions` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`player_season_id` integer NOT NULL,
	`position_id` integer NOT NULL,
	`priority` integer NOT NULL,
	CONSTRAINT `fk_player_season_positions_player_season_id_player_seasons_id_fk` FOREIGN KEY (`player_season_id`) REFERENCES `player_seasons`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_player_season_positions_position_id_positions_id_fk` FOREIGN KEY (`position_id`) REFERENCES `positions`(`id`) ON DELETE RESTRICT
);
--> statement-breakpoint
INSERT INTO `__new_player_season_positions`(`id`, `player_season_id`, `position_id`, `priority`) SELECT `id`, `player_season_id`, `position_id`, `priority` FROM `player_season_positions`;--> statement-breakpoint
DROP TABLE `player_season_positions`;--> statement-breakpoint
ALTER TABLE `__new_player_season_positions` RENAME TO `player_season_positions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_player_season_stats` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`player_season_id` integer NOT NULL,
	`stat_type_id` integer NOT NULL,
	`competition_id` integer,
	`value` integer NOT NULL,
	CONSTRAINT `fk_player_season_stats_player_season_id_player_seasons_id_fk` FOREIGN KEY (`player_season_id`) REFERENCES `player_seasons`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_player_season_stats_stat_type_id_stat_types_id_fk` FOREIGN KEY (`stat_type_id`) REFERENCES `stat_types`(`id`) ON DELETE RESTRICT,
	CONSTRAINT `fk_player_season_stats_competition_id_competitions_id_fk` FOREIGN KEY (`competition_id`) REFERENCES `competitions`(`id`) ON DELETE RESTRICT
);
--> statement-breakpoint
INSERT INTO `__new_player_season_stats`(`id`, `player_season_id`, `stat_type_id`, `competition_id`, `value`) SELECT `id`, `player_season_id`, `stat_type_id`, `competition_id`, `value` FROM `player_season_stats`;--> statement-breakpoint
DROP TABLE `player_season_stats`;--> statement-breakpoint
ALTER TABLE `__new_player_season_stats` RENAME TO `player_season_stats`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_player_seasons` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`save_player_id` integer NOT NULL,
	`season_id` integer NOT NULL,
	`save_team_id` integer,
	CONSTRAINT `fk_player_seasons_save_player_id_save_players_id_fk` FOREIGN KEY (`save_player_id`) REFERENCES `save_players`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_player_seasons_season_id_seasons_id_fk` FOREIGN KEY (`season_id`) REFERENCES `seasons`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_player_seasons_save_team_id_save_teams_id_fk` FOREIGN KEY (`save_team_id`) REFERENCES `save_teams`(`id`) ON DELETE SET NULL,
	CONSTRAINT `player_seasons_save_player_id_season_id_unique` UNIQUE(`save_player_id`,`season_id`)
);
--> statement-breakpoint
INSERT INTO `__new_player_seasons`(`id`, `save_player_id`, `season_id`, `save_team_id`) SELECT `id`, `save_player_id`, `season_id`, `save_team_id` FROM `player_seasons`;--> statement-breakpoint
DROP TABLE `player_seasons`;--> statement-breakpoint
ALTER TABLE `__new_player_seasons` RENAME TO `player_seasons`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_save_players` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`save_id` integer NOT NULL,
	`player_id` integer NOT NULL,
	CONSTRAINT `fk_save_players_save_id_saves_id_fk` FOREIGN KEY (`save_id`) REFERENCES `saves`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_save_players_player_id_players_id_fk` FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON DELETE RESTRICT,
	CONSTRAINT `save_players_save_id_player_id_unique` UNIQUE(`save_id`,`player_id`)
);
--> statement-breakpoint
INSERT INTO `__new_save_players`(`id`, `save_id`, `player_id`) SELECT `id`, `save_id`, `player_id` FROM `save_players`;--> statement-breakpoint
DROP TABLE `save_players`;--> statement-breakpoint
ALTER TABLE `__new_save_players` RENAME TO `save_players`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_save_teams` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`save_id` integer NOT NULL,
	`team_id` integer NOT NULL,
	CONSTRAINT `fk_save_teams_save_id_saves_id_fk` FOREIGN KEY (`save_id`) REFERENCES `saves`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_save_teams_team_id_teams_id_fk` FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE RESTRICT,
	CONSTRAINT `save_teams_save_id_team_id_unique` UNIQUE(`save_id`,`team_id`)
);
--> statement-breakpoint
INSERT INTO `__new_save_teams`(`id`, `save_id`, `team_id`) SELECT `id`, `save_id`, `team_id` FROM `save_teams`;--> statement-breakpoint
DROP TABLE `save_teams`;--> statement-breakpoint
ALTER TABLE `__new_save_teams` RENAME TO `save_teams`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_seasons` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`save_id` integer NOT NULL,
	`label` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`order_index` integer NOT NULL,
	CONSTRAINT `fk_seasons_save_id_saves_id_fk` FOREIGN KEY (`save_id`) REFERENCES `saves`(`id`) ON DELETE CASCADE,
	CONSTRAINT `seasons_save_id_label_unique` UNIQUE(`save_id`,`label`)
);
--> statement-breakpoint
INSERT INTO `__new_seasons`(`id`, `save_id`, `label`, `start_date`, `end_date`, `order_index`) SELECT `id`, `save_id`, `label`, `start_date`, `end_date`, `order_index` FROM `seasons`;--> statement-breakpoint
DROP TABLE `seasons`;--> statement-breakpoint
ALTER TABLE `__new_seasons` RENAME TO `seasons`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_transfers` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`save_player_id` integer NOT NULL,
	`season_id` integer NOT NULL,
	`from_save_team_id` integer,
	`to_save_team_id` integer,
	`type` text NOT NULL,
	`fee` integer,
	`currency` text,
	`event_date` text NOT NULL,
	CONSTRAINT `fk_transfers_save_player_id_save_players_id_fk` FOREIGN KEY (`save_player_id`) REFERENCES `save_players`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_transfers_season_id_seasons_id_fk` FOREIGN KEY (`season_id`) REFERENCES `seasons`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_transfers_from_save_team_id_save_teams_id_fk` FOREIGN KEY (`from_save_team_id`) REFERENCES `save_teams`(`id`) ON DELETE SET NULL,
	CONSTRAINT `fk_transfers_to_save_team_id_save_teams_id_fk` FOREIGN KEY (`to_save_team_id`) REFERENCES `save_teams`(`id`) ON DELETE SET NULL
);
--> statement-breakpoint
INSERT INTO `__new_transfers`(`id`, `save_player_id`, `season_id`, `from_save_team_id`, `to_save_team_id`, `type`, `fee`, `currency`, `event_date`) SELECT `id`, `save_player_id`, `season_id`, `from_save_team_id`, `to_save_team_id`, `type`, `fee`, `currency`, `event_date` FROM `transfers`;--> statement-breakpoint
DROP TABLE `transfers`;--> statement-breakpoint
ALTER TABLE `__new_transfers` RENAME TO `transfers`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
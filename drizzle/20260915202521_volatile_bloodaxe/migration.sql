CREATE TABLE `competition_editions` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`save_id` integer NOT NULL,
	`competition_id` integer NOT NULL,
	`season_id` integer,
	`label` text NOT NULL,
	`start_date` text,
	`end_date` text,
	CONSTRAINT `fk_competition_editions_save_id_saves_id_fk` FOREIGN KEY (`save_id`) REFERENCES `saves`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_competition_editions_competition_id_competitions_id_fk` FOREIGN KEY (`competition_id`) REFERENCES `competitions`(`id`) ON DELETE RESTRICT,
	CONSTRAINT `fk_competition_editions_season_id_seasons_id_fk` FOREIGN KEY (`season_id`) REFERENCES `seasons`(`id`) ON DELETE SET NULL,
	CONSTRAINT `competition_editions_save_competition_label_unique` UNIQUE(`save_id`,`competition_id`,`label`)
);
--> statement-breakpoint
CREATE TABLE `competition_participants` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`competition_edition_id` integer NOT NULL,
	`save_team_id` integer NOT NULL,
	CONSTRAINT `fk_competition_participants_competition_edition_id_competition_editions_id_fk` FOREIGN KEY (`competition_edition_id`) REFERENCES `competition_editions`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_competition_participants_save_team_id_save_teams_id_fk` FOREIGN KEY (`save_team_id`) REFERENCES `save_teams`(`id`) ON DELETE CASCADE,
	CONSTRAINT `competition_participants_edition_team_unique` UNIQUE(`competition_edition_id`,`save_team_id`)
);
--> statement-breakpoint
CREATE TABLE `competition_stage_group_teams` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`competition_stage_group_id` integer NOT NULL,
	`competition_participant_id` integer NOT NULL,
	CONSTRAINT `fk_competition_stage_group_teams_competition_stage_group_id_competition_stage_groups_id_fk` FOREIGN KEY (`competition_stage_group_id`) REFERENCES `competition_stage_groups`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_competition_stage_group_teams_competition_participant_id_competition_participants_id_fk` FOREIGN KEY (`competition_participant_id`) REFERENCES `competition_participants`(`id`) ON DELETE CASCADE,
	CONSTRAINT `competition_stage_group_teams_group_participant_unique` UNIQUE(`competition_stage_group_id`,`competition_participant_id`)
);
--> statement-breakpoint
CREATE TABLE `competition_stage_groups` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`competition_stage_id` integer NOT NULL,
	`name` text NOT NULL,
	`order_index` integer NOT NULL,
	CONSTRAINT `fk_competition_stage_groups_competition_stage_id_competition_stages_id_fk` FOREIGN KEY (`competition_stage_id`) REFERENCES `competition_stages`(`id`) ON DELETE CASCADE,
	CONSTRAINT `competition_stage_groups_stage_order_unique` UNIQUE(`competition_stage_id`,`order_index`)
);
--> statement-breakpoint
CREATE TABLE `competition_stage_team_stats` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`competition_stage_id` integer NOT NULL,
	`competition_participant_id` integer NOT NULL,
	`competition_stage_group_id` integer,
	`position` integer,
	`played` integer,
	`wins` integer,
	`draws` integer,
	`losses` integer,
	`goals_for` integer,
	`goals_against` integer,
	`points` integer,
	CONSTRAINT `fk_competition_stage_team_stats_competition_stage_id_competition_stages_id_fk` FOREIGN KEY (`competition_stage_id`) REFERENCES `competition_stages`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_competition_stage_team_stats_competition_participant_id_competition_participants_id_fk` FOREIGN KEY (`competition_participant_id`) REFERENCES `competition_participants`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_competition_stage_team_stats_competition_stage_group_id_competition_stage_groups_id_fk` FOREIGN KEY (`competition_stage_group_id`) REFERENCES `competition_stage_groups`(`id`) ON DELETE SET NULL,
	CONSTRAINT `competition_stage_team_stats_stage_participant_unique` UNIQUE(`competition_stage_id`,`competition_participant_id`)
);
--> statement-breakpoint
CREATE TABLE `competition_stages` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`competition_edition_id` integer NOT NULL,
	`name` text NOT NULL,
	`order_index` integer NOT NULL,
	`type` text NOT NULL,
	`match_format` text,
	`draw_policy` text NOT NULL,
	`group_count` integer,
	`teams_per_group` integer,
	`advancing_teams_per_group` integer,
	`matches_per_team` integer,
	`points_for_win` integer DEFAULT 3,
	`points_for_draw` integer DEFAULT 1,
	`points_for_loss` integer DEFAULT 0,
	`away_goals_rule` integer DEFAULT false NOT NULL,
	CONSTRAINT `fk_competition_stages_competition_edition_id_competition_editions_id_fk` FOREIGN KEY (`competition_edition_id`) REFERENCES `competition_editions`(`id`) ON DELETE CASCADE,
	CONSTRAINT `competition_stages_edition_order_unique` UNIQUE(`competition_edition_id`,`order_index`)
);
--> statement-breakpoint
CREATE TABLE `international_windows` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`save_id` integer NOT NULL,
	`national_save_team_id` integer NOT NULL,
	`name` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	CONSTRAINT `fk_international_windows_save_id_saves_id_fk` FOREIGN KEY (`save_id`) REFERENCES `saves`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_international_windows_national_save_team_id_save_teams_id_fk` FOREIGN KEY (`national_save_team_id`) REFERENCES `save_teams`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `match_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`match_id` integer NOT NULL,
	`save_team_id` integer,
	`save_player_id` integer,
	`player_name` text,
	`assist_save_player_id` integer,
	`assist_player_name` text,
	`type` text NOT NULL,
	`minute` integer,
	`added_time` integer,
	`order_index` integer,
	`notes` text,
	CONSTRAINT `fk_match_events_match_id_matches_id_fk` FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_match_events_save_team_id_save_teams_id_fk` FOREIGN KEY (`save_team_id`) REFERENCES `save_teams`(`id`) ON DELETE SET NULL,
	CONSTRAINT `fk_match_events_save_player_id_save_players_id_fk` FOREIGN KEY (`save_player_id`) REFERENCES `save_players`(`id`) ON DELETE SET NULL,
	CONSTRAINT `fk_match_events_assist_save_player_id_save_players_id_fk` FOREIGN KEY (`assist_save_player_id`) REFERENCES `save_players`(`id`) ON DELETE SET NULL
);
--> statement-breakpoint
CREATE TABLE `match_player_appearances` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`match_id` integer NOT NULL,
	`save_team_id` integer,
	`save_player_id` integer,
	`player_name` text NOT NULL,
	`status` text NOT NULL,
	`position_id` integer,
	`shirt_number` integer,
	`minutes_played` integer,
	`entered_minute` integer,
	`exited_minute` integer,
	`rating` real,
	`is_captain` integer DEFAULT false NOT NULL,
	`is_man_of_the_match` integer DEFAULT false NOT NULL,
	CONSTRAINT `fk_match_player_appearances_match_id_matches_id_fk` FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_match_player_appearances_save_team_id_save_teams_id_fk` FOREIGN KEY (`save_team_id`) REFERENCES `save_teams`(`id`) ON DELETE SET NULL,
	CONSTRAINT `fk_match_player_appearances_save_player_id_save_players_id_fk` FOREIGN KEY (`save_player_id`) REFERENCES `save_players`(`id`) ON DELETE SET NULL,
	CONSTRAINT `fk_match_player_appearances_position_id_positions_id_fk` FOREIGN KEY (`position_id`) REFERENCES `positions`(`id`) ON DELETE SET NULL
);
--> statement-breakpoint
CREATE TABLE `match_ties` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`competition_stage_id` integer NOT NULL,
	`label` text,
	`order_index` integer NOT NULL,
	CONSTRAINT `fk_match_ties_competition_stage_id_competition_stages_id_fk` FOREIGN KEY (`competition_stage_id`) REFERENCES `competition_stages`(`id`) ON DELETE CASCADE,
	CONSTRAINT `match_ties_stage_order_unique` UNIQUE(`competition_stage_id`,`order_index`)
);
--> statement-breakpoint
CREATE TABLE `matches` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`save_id` integer NOT NULL,
	`season_id` integer,
	`competition_edition_id` integer,
	`competition_stage_id` integer,
	`match_tie_id` integer,
	`international_window_id` integer,
	`home_save_team_id` integer,
	`away_save_team_id` integer,
	`home_team_name` text NOT NULL,
	`away_team_name` text NOT NULL,
	`stadium_id` integer,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`match_date` text,
	`order_index` integer,
	`leg_number` integer,
	`home_score_90` integer,
	`away_score_90` integer,
	`home_score` integer,
	`away_score` integer,
	`went_to_extra_time` integer DEFAULT false NOT NULL,
	`home_penalty_score` integer,
	`away_penalty_score` integer,
	`notes` text,
	CONSTRAINT `fk_matches_save_id_saves_id_fk` FOREIGN KEY (`save_id`) REFERENCES `saves`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_matches_season_id_seasons_id_fk` FOREIGN KEY (`season_id`) REFERENCES `seasons`(`id`) ON DELETE SET NULL,
	CONSTRAINT `fk_matches_competition_edition_id_competition_editions_id_fk` FOREIGN KEY (`competition_edition_id`) REFERENCES `competition_editions`(`id`) ON DELETE SET NULL,
	CONSTRAINT `fk_matches_competition_stage_id_competition_stages_id_fk` FOREIGN KEY (`competition_stage_id`) REFERENCES `competition_stages`(`id`) ON DELETE SET NULL,
	CONSTRAINT `fk_matches_match_tie_id_match_ties_id_fk` FOREIGN KEY (`match_tie_id`) REFERENCES `match_ties`(`id`) ON DELETE SET NULL,
	CONSTRAINT `fk_matches_international_window_id_international_windows_id_fk` FOREIGN KEY (`international_window_id`) REFERENCES `international_windows`(`id`) ON DELETE SET NULL,
	CONSTRAINT `fk_matches_home_save_team_id_save_teams_id_fk` FOREIGN KEY (`home_save_team_id`) REFERENCES `save_teams`(`id`) ON DELETE SET NULL,
	CONSTRAINT `fk_matches_away_save_team_id_save_teams_id_fk` FOREIGN KEY (`away_save_team_id`) REFERENCES `save_teams`(`id`) ON DELETE SET NULL,
	CONSTRAINT `fk_matches_stadium_id_stadiums_id_fk` FOREIGN KEY (`stadium_id`) REFERENCES `stadiums`(`id`) ON DELETE SET NULL
);
--> statement-breakpoint
CREATE TABLE `national_team_callup_players` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`national_team_callup_id` integer NOT NULL,
	`save_player_id` integer,
	`player_name` text NOT NULL,
	`squad_number` integer,
	`status` text DEFAULT 'selected' NOT NULL,
	CONSTRAINT `fk_national_team_callup_players_national_team_callup_id_national_team_callups_id_fk` FOREIGN KEY (`national_team_callup_id`) REFERENCES `national_team_callups`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_national_team_callup_players_save_player_id_save_players_id_fk` FOREIGN KEY (`save_player_id`) REFERENCES `save_players`(`id`) ON DELETE SET NULL
);
--> statement-breakpoint
CREATE TABLE `national_team_callups` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`save_id` integer NOT NULL,
	`national_save_team_id` integer NOT NULL,
	`international_window_id` integer,
	`competition_edition_id` integer,
	`name` text NOT NULL,
	`announced_date` text,
	`start_date` text,
	`end_date` text,
	CONSTRAINT `fk_national_team_callups_save_id_saves_id_fk` FOREIGN KEY (`save_id`) REFERENCES `saves`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_national_team_callups_national_save_team_id_save_teams_id_fk` FOREIGN KEY (`national_save_team_id`) REFERENCES `save_teams`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_national_team_callups_international_window_id_international_windows_id_fk` FOREIGN KEY (`international_window_id`) REFERENCES `international_windows`(`id`) ON DELETE SET NULL,
	CONSTRAINT `fk_national_team_callups_competition_edition_id_competition_editions_id_fk` FOREIGN KEY (`competition_edition_id`) REFERENCES `competition_editions`(`id`) ON DELETE SET NULL
);
--> statement-breakpoint
CREATE TABLE `penalty_shootout_kicks` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`match_id` integer NOT NULL,
	`save_team_id` integer,
	`save_player_id` integer,
	`player_name` text,
	`order_index` integer NOT NULL,
	`result` text NOT NULL,
	CONSTRAINT `fk_penalty_shootout_kicks_match_id_matches_id_fk` FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_penalty_shootout_kicks_save_team_id_save_teams_id_fk` FOREIGN KEY (`save_team_id`) REFERENCES `save_teams`(`id`) ON DELETE SET NULL,
	CONSTRAINT `fk_penalty_shootout_kicks_save_player_id_save_players_id_fk` FOREIGN KEY (`save_player_id`) REFERENCES `save_players`(`id`) ON DELETE SET NULL,
	CONSTRAINT `penalty_shootout_kicks_match_order_unique` UNIQUE(`match_id`,`order_index`)
);
--> statement-breakpoint
CREATE TABLE `player_absences` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`save_player_id` integer NOT NULL,
	`type` text NOT NULL,
	`name` text,
	`start_date` text NOT NULL,
	`end_date` text,
	`start_season_id` integer,
	`end_season_id` integer,
	`notes` text,
	CONSTRAINT `fk_player_absences_save_player_id_save_players_id_fk` FOREIGN KEY (`save_player_id`) REFERENCES `save_players`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_player_absences_start_season_id_seasons_id_fk` FOREIGN KEY (`start_season_id`) REFERENCES `seasons`(`id`) ON DELETE SET NULL,
	CONSTRAINT `fk_player_absences_end_season_id_seasons_id_fk` FOREIGN KEY (`end_season_id`) REFERENCES `seasons`(`id`) ON DELETE SET NULL
);
--> statement-breakpoint
CREATE TABLE `player_attribute_types` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`key` text NOT NULL UNIQUE,
	`name` text NOT NULL,
	`category` text
);
--> statement-breakpoint
CREATE TABLE `player_attribute_values` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`player_update_id` integer NOT NULL,
	`attribute_type_id` integer NOT NULL,
	`value` integer NOT NULL,
	CONSTRAINT `fk_player_attribute_values_player_update_id_player_updates_id_fk` FOREIGN KEY (`player_update_id`) REFERENCES `player_updates`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_player_attribute_values_attribute_type_id_player_attribute_types_id_fk` FOREIGN KEY (`attribute_type_id`) REFERENCES `player_attribute_types`(`id`) ON DELETE RESTRICT,
	CONSTRAINT `player_attribute_values_update_type_unique` UNIQUE(`player_update_id`,`attribute_type_id`)
);
--> statement-breakpoint
CREATE TABLE `player_team_stints` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`player_season_id` integer NOT NULL,
	`save_team_id` integer,
	`start_date` text,
	`end_date` text,
	`order_index` integer NOT NULL,
	CONSTRAINT `fk_player_team_stints_player_season_id_player_seasons_id_fk` FOREIGN KEY (`player_season_id`) REFERENCES `player_seasons`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_player_team_stints_save_team_id_save_teams_id_fk` FOREIGN KEY (`save_team_id`) REFERENCES `save_teams`(`id`) ON DELETE SET NULL,
	CONSTRAINT `player_team_stints_season_order_unique` UNIQUE(`player_season_id`,`order_index`)
);
--> statement-breakpoint
CREATE TABLE `stadiums` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`city` text,
	`country_id` integer,
	CONSTRAINT `fk_stadiums_country_id_countries_id_fk` FOREIGN KEY (`country_id`) REFERENCES `countries`(`id`) ON DELETE RESTRICT
);
--> statement-breakpoint
CREATE TABLE `team_competition_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`save_team_id` integer NOT NULL,
	`competition_id` integer NOT NULL,
	`baseline_titles` integer DEFAULT 0 NOT NULL,
	CONSTRAINT `fk_team_competition_history_save_team_id_save_teams_id_fk` FOREIGN KEY (`save_team_id`) REFERENCES `save_teams`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_team_competition_history_competition_id_competitions_id_fk` FOREIGN KEY (`competition_id`) REFERENCES `competitions`(`id`) ON DELETE RESTRICT,
	CONSTRAINT `team_competition_history_team_competition_unique` UNIQUE(`save_team_id`,`competition_id`)
);
--> statement-breakpoint
ALTER TABLE `competitions` ADD `participant_type` text NOT NULL;--> statement-breakpoint
ALTER TABLE `honours` ADD `competition_edition_id` integer REFERENCES competition_editions(id) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE `player_career_events` ADD `notes` text;--> statement-breakpoint
ALTER TABLE `player_season_stats` ADD `competition_edition_id` integer REFERENCES competition_editions(id) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE `player_season_stats` ADD `player_team_stint_id` integer REFERENCES player_team_stints(id) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE `player_updates` ADD `player_season_id` integer NOT NULL REFERENCES player_seasons(id) ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE `save_teams` ADD `home_stadium_id` integer REFERENCES stadiums(id) ON DELETE SET NULL;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_player_season_positions` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`player_season_id` integer NOT NULL,
	`position_id` integer NOT NULL,
	`priority` integer NOT NULL,
	CONSTRAINT `fk_player_season_positions_player_season_id_player_seasons_id_fk` FOREIGN KEY (`player_season_id`) REFERENCES `player_seasons`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_player_season_positions_position_id_positions_id_fk` FOREIGN KEY (`position_id`) REFERENCES `positions`(`id`) ON DELETE RESTRICT,
	CONSTRAINT `player_season_positions_position_unique` UNIQUE(`player_season_id`,`position_id`),
	CONSTRAINT `player_season_positions_priority_unique` UNIQUE(`player_season_id`,`priority`)
);
--> statement-breakpoint
INSERT INTO `__new_player_season_positions`(`id`, `player_season_id`, `position_id`, `priority`) SELECT `id`, `player_season_id`, `position_id`, `priority` FROM `player_season_positions`;--> statement-breakpoint
DROP TABLE `player_season_positions`;--> statement-breakpoint
ALTER TABLE `__new_player_season_positions` RENAME TO `player_season_positions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_player_updates` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`player_season_id` integer NOT NULL,
	`effective_date` text,
	`order_index` integer NOT NULL,
	`overall` integer,
	`shirt_number` integer,
	`shirt_name` text,
	CONSTRAINT `fk_player_updates_player_season_id_player_seasons_id_fk` FOREIGN KEY (`player_season_id`) REFERENCES `player_seasons`(`id`) ON DELETE CASCADE,
	CONSTRAINT `player_updates_season_order_unique` UNIQUE(`player_season_id`,`order_index`)
);
--> statement-breakpoint
INSERT INTO `__new_player_updates`(`id`, `effective_date`, `order_index`, `overall`, `shirt_number`, `shirt_name`) SELECT `id`, `effective_date`, `order_index`, `overall`, `shirt_number`, `shirt_name` FROM `player_updates`;--> statement-breakpoint
DROP TABLE `player_updates`;--> statement-breakpoint
ALTER TABLE `__new_player_updates` RENAME TO `player_updates`;--> statement-breakpoint
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
	CONSTRAINT `seasons_save_id_label_unique` UNIQUE(`save_id`,`label`),
	CONSTRAINT `seasons_save_id_order_index_unique` UNIQUE(`save_id`,`order_index`)
);
--> statement-breakpoint
INSERT INTO `__new_seasons`(`id`, `save_id`, `label`, `start_date`, `end_date`, `order_index`) SELECT `id`, `save_id`, `label`, `start_date`, `end_date`, `order_index` FROM `seasons`;--> statement-breakpoint
DROP TABLE `seasons`;--> statement-breakpoint
ALTER TABLE `__new_seasons` RENAME TO `seasons`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_positions` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`key` text NOT NULL UNIQUE,
	`name` text NOT NULL,
	`category` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_positions`(`id`, `key`, `name`, `category`) SELECT `id`, `key`, `name`, `category` FROM `positions`;--> statement-breakpoint
DROP TABLE `positions`;--> statement-breakpoint
ALTER TABLE `__new_positions` RENAME TO `positions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_player_season_stats` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`player_season_id` integer NOT NULL,
	`stat_type_id` integer NOT NULL,
	`competition_edition_id` integer,
	`player_team_stint_id` integer,
	`value` integer NOT NULL,
	CONSTRAINT `fk_player_season_stats_player_season_id_player_seasons_id_fk` FOREIGN KEY (`player_season_id`) REFERENCES `player_seasons`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_player_season_stats_stat_type_id_stat_types_id_fk` FOREIGN KEY (`stat_type_id`) REFERENCES `stat_types`(`id`) ON DELETE RESTRICT,
	CONSTRAINT `fk_player_season_stats_competition_edition_id_competition_editions_id_fk` FOREIGN KEY (`competition_edition_id`) REFERENCES `competition_editions`(`id`) ON DELETE SET NULL,
	CONSTRAINT `fk_player_season_stats_player_team_stint_id_player_team_stints_id_fk` FOREIGN KEY (`player_team_stint_id`) REFERENCES `player_team_stints`(`id`) ON DELETE SET NULL
);
--> statement-breakpoint
INSERT INTO `__new_player_season_stats`(`id`, `player_season_id`, `stat_type_id`, `value`) SELECT `id`, `player_season_id`, `stat_type_id`, `value` FROM `player_season_stats`;--> statement-breakpoint
DROP TABLE `player_season_stats`;--> statement-breakpoint
ALTER TABLE `__new_player_season_stats` RENAME TO `player_season_stats`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_player_seasons` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`save_player_id` integer NOT NULL,
	`season_id` integer NOT NULL,
	CONSTRAINT `fk_player_seasons_save_player_id_save_players_id_fk` FOREIGN KEY (`save_player_id`) REFERENCES `save_players`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_player_seasons_season_id_seasons_id_fk` FOREIGN KEY (`season_id`) REFERENCES `seasons`(`id`) ON DELETE CASCADE,
	CONSTRAINT `player_seasons_save_player_id_season_id_unique` UNIQUE(`save_player_id`,`season_id`)
);
--> statement-breakpoint
INSERT INTO `__new_player_seasons`(`id`, `save_player_id`, `season_id`) SELECT `id`, `save_player_id`, `season_id` FROM `player_seasons`;--> statement-breakpoint
DROP TABLE `player_seasons`;--> statement-breakpoint
ALTER TABLE `__new_player_seasons` RENAME TO `player_seasons`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_contracts` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`save_player_id` integer NOT NULL,
	`save_team_id` integer,
	`start_season_id` integer NOT NULL,
	`end_season_id` integer,
	`weekly_salary` integer,
	`currency` text,
	`signed_date` text,
	CONSTRAINT `fk_contracts_save_player_id_save_players_id_fk` FOREIGN KEY (`save_player_id`) REFERENCES `save_players`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_contracts_save_team_id_save_teams_id_fk` FOREIGN KEY (`save_team_id`) REFERENCES `save_teams`(`id`) ON DELETE SET NULL,
	CONSTRAINT `fk_contracts_start_season_id_seasons_id_fk` FOREIGN KEY (`start_season_id`) REFERENCES `seasons`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_contracts_end_season_id_seasons_id_fk` FOREIGN KEY (`end_season_id`) REFERENCES `seasons`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_contracts`(`id`, `save_player_id`, `save_team_id`, `start_season_id`, `end_season_id`, `weekly_salary`, `currency`, `signed_date`) SELECT `id`, `save_player_id`, `save_team_id`, `start_season_id`, `end_season_id`, `weekly_salary`, `currency`, `signed_date` FROM `contracts`;--> statement-breakpoint
DROP TABLE `contracts`;--> statement-breakpoint
ALTER TABLE `__new_contracts` RENAME TO `contracts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
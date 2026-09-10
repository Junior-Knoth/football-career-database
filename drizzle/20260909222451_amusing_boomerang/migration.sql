PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_saves` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`game_id` integer NOT NULL,
	CONSTRAINT `fk_saves_game_id_games_id_fk` FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON DELETE RESTRICT
);
--> statement-breakpoint
INSERT INTO `__new_saves`(`id`, `name`, `game_id`) SELECT `id`, `name`, `game_id` FROM `saves`;--> statement-breakpoint
DROP TABLE `saves`;--> statement-breakpoint
ALTER TABLE `__new_saves` RENAME TO `saves`;--> statement-breakpoint
PRAGMA foreign_keys=ON;
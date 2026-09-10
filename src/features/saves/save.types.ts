import type { Game } from "../games/game.types";

export type Save = {
  id: number;
  name: string;
  game: Game;
};

export type CreateSaveInput = {
  name: string;
  gameId: number;
};

export type CreateSaveResponse = {
  id: number;
  name: string;
  gameId: number;
};

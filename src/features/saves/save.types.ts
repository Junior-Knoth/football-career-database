import type { Game } from "../games/game.types";

export type Save = {
  id: number;
  name: string;
  status: "active" | "finished" | "archived";
  currentSeasonId: number | null;
  game: Game;
  manager: {
    name: string;
    birthDate: string;
    nationalityId: number | null;
  };
};

export type CreateSaveInput = {
  name: string;
  gameId: number;
  managerName: string;
  managerBirthDate: string;
  managerNationalityId: number | null;
};

export type CreateSaveResponse = {
  id: number;
  name: string;
  gameId: number;
};

export type UpdateSaveInput = {
  name?: string;
  managerName?: string;
  managerBirthDate?: string;
  managerNationalityId?: number;
  status?: "active" | "finished" | "archived";
};

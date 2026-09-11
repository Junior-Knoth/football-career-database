import { api } from "../../api/http";
import type { Game } from "./game.types";

export const gameApi = {
  list: () => api.get<Game[]>("/games"),
  getById: (id: number) => api.get<Game>(`/games/${id}`),
};

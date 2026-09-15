import { api } from "../../api/http";
import type {
  CreateSeasonInput,
  Season,
  SetCurrentSeasonResponse,
  UpdateSeasonInput,
} from "./season.types";

export const seasonApi = {
  listBySaveId: (saveId: number) =>
    api.get<Season[]>(`/seasons?saveId=${saveId}`),
  getById: (id: number) => api.get<Season>(`/seasons/${id}`),
  create: (data: CreateSeasonInput) => api.post<Season>("/seasons", data),
  update: (id: number, data: UpdateSeasonInput) =>
    api.patch<Season>(`/seasons/${id}`, data),
  remove: (id: number) => api.delete<Season>(`/seasons/${id}`),
  setCurrent: (saveId: number, seasonId: number) =>
    api.patch<SetCurrentSeasonResponse>(`/saves/${saveId}/current-season`, {
      seasonId,
    }),
};

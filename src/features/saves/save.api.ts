import { api } from "../../api/http";
import type { CreateSaveInput, Save, UpdateSaveInput } from "./save.types";

export const saveApi = {
  list: () => api.get<Save[]>("/saves"),
  create: (data: CreateSaveInput) => api.post<Save>("/saves", data),
  getById: (id: number) => api.get<Save>(`/saves/${id}`),
  getByGameId: (gameId: number) => api.get<Save[]>(`/saves?gameId=${gameId}`),
  delete: (id: number) => api.delete<Save>(`/saves/${id}`),
  update: (id: number, data: UpdateSaveInput) =>
    api.patch<Save>(`/saves/${id}`, data),
};

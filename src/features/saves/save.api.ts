import { api } from "../../api/http";
import type { CreateSaveInput, CreateSaveResponse, Save } from "./save.types";

export const saveApi = {
  list: () => api.get<Save[]>("/saves"),
  create: (data: CreateSaveInput) =>
    api.post<CreateSaveResponse>("/saves", data),
  getById: (id: number) => api.get<Save>(`/saves/${id}`),
  getByGameId: (gameId: number) => api.get<Save[]>(`/saves?gameId=${gameId}`),
};

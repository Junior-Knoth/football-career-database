import { api } from "../../api/http";
import type { Country } from "./countries.types";

export const countryApi = {
  list: () => api.get<Country[]>("/countries"),
  getById: (id: number) => api.get<Country>(`countries/${id}`),
};

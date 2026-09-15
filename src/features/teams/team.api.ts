import { api } from "../../api/http";
import type {
  CreateManagerAssignmentInput,
  CreateSaveTeamInput,
  CreateTeamInput,
  ManagerAssignment,
  ManagerAssignmentFilters,
  SaveTeam,
  SaveTeamFilters,
  Team,
  TeamFilters,
  TeamType,
  UpdateTeamInput,
} from "./team.types";

function createQuery(
  values: Record<string, string | number | boolean | undefined>,
) {
  const searchParams = new URLSearchParams();

  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export const teamApi = {
  list: (filters: TeamFilters = {}) =>
    api.get<Team[]>(`/teams${createQuery(filters)}`),
  getById: (id: number) => api.get<Team>(`/teams/${id}`),
  create: (data: CreateTeamInput) => api.post<Team>("/teams", data),
  update: (id: number, data: UpdateTeamInput) =>
    api.patch<Team>(`/teams/${id}`, data),
};

export const saveTeamApi = {
  listBySaveId: (saveId: number, filters: SaveTeamFilters = {}) =>
    api.get<SaveTeam[]>(
      `/save-teams${createQuery({ saveId, ...filters })}`,
    ),
  getById: (id: number) => api.get<SaveTeam>(`/save-teams/${id}`),
  create: (data: CreateSaveTeamInput) =>
    api.post<SaveTeam>("/save-teams", data),
};

export const managerAssignmentApi = {
  listBySaveId: (
    saveId: number,
    filters: ManagerAssignmentFilters = {},
  ) =>
    api.get<ManagerAssignment[]>(
      `/manager-assignments${createQuery({ saveId, ...filters })}`,
    ),
  getById: (id: number) =>
    api.get<ManagerAssignment>(`/manager-assignments/${id}`),
  getCurrent: (saveId: number, type: TeamType) =>
    api.get<ManagerAssignment | null>(
      `/manager-assignments/current${createQuery({ saveId, type })}`,
    ),
  create: (data: CreateManagerAssignmentInput) =>
    api.post<ManagerAssignment>("/manager-assignments", data),
};

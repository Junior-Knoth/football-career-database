import type { Country } from "../countries/countries.types";

export type TeamType = "club" | "national";

export type Team = {
  id: number;
  name: string;
  shortName: string | null;
  shortCode: string | null;
  type: TeamType;
  countryId: number;
  country: Country;
};

export type TeamFilters = {
  type?: TeamType;
  countryId?: number;
  search?: string;
};

export type CreateTeamInput = {
  name: string;
  shortName?: string | null;
  shortCode?: string | null;
  type: TeamType;
  countryId: number;
};

export type UpdateTeamInput = {
  name?: string;
  shortName?: string | null;
  shortCode?: string | null;
  countryId?: number;
};

export type SaveTeam = {
  id: number;
  saveId: number;
  teamId: number;
  team: Team;
};

export type SaveTeamFilters = {
  type?: TeamType;
};

export type CreateSaveTeamInput = {
  saveId: number;
  teamId: number;
};

export type ManagerAssignment = {
  id: number;
  saveId: number;
  saveTeamId: number;
  startSeasonId: number;
  endSeasonId: number | null;
  startDate: string | null;
  endDate: string | null;
  startSeason: {
    id: number;
    label: string;
    orderIndex: number;
  };
  saveTeam: SaveTeam;
};

export type ManagerAssignmentFilters = {
  type?: TeamType;
  active?: boolean;
};

export type CreateManagerAssignmentInput = {
  saveId: number;
  saveTeamId: number;
  startSeasonId: number;
  endSeasonId?: number | null;
  startDate?: string | null;
  endDate?: string | null;
};

export type Season = {
  id: number;
  saveId: number;
  label: string;
  startDate: string;
  endDate: string;
  orderIndex: number;
};

export type CreateSeasonInput = {
  saveId: number;
  label: string;
  startDate: string;
  endDate: string;
};

export type UpdateSeasonInput = {
  label?: string;
  startDate?: string;
  endDate?: string;
};

export type SetCurrentSeasonResponse = {
  saveId: number;
  currentSeasonId: number;
};

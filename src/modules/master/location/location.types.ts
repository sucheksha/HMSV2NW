export type SortOrder = "asc" | "desc";

export interface State {
  _id: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface District {
  _id: string;
  name: string;
  state: string | State;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Taluka {
  _id: string;
  name: string;
  district: string | District;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LocationListParams {
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
}

export interface DistrictListParams extends LocationListParams {
  state?: string;
}

export interface TalukaListParams extends LocationListParams {
  district?: string;
}

export interface StateFormValues {
  name: string;
  code: string;
}

export interface DistrictFormValues {
  name: string;
  state: string;
}

export interface TalukaFormValues {
  name: string;
  district: string;
}

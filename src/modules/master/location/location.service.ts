import api from "@/services/api";
import type {
  State,
  District,
  Taluka,
  StateFormValues,
  DistrictFormValues,
  TalukaFormValues,
  LocationListParams,
  DistrictListParams,
  TalukaListParams,
} from "./location.types";

const ENDPOINTS = {
  states: "/master/states",
  districts: "/master/districts",
  talukas: "/master/talukas",
};

function unwrap<T>(response: any): T {
  return response?.data?.data ?? response?.data;
}

function unwrapList<T>(response: any): T[] {
  const result = unwrap<any>(response);

  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.items)) return result.items;
  if (Array.isArray(result?.states)) return result.states;
  if (Array.isArray(result?.districts)) return result.districts;
  if (Array.isArray(result?.talukas)) return result.talukas;
  if (Array.isArray(result?.results)) return result.results;

  return [];
}

// States
export async function getStates(params: LocationListParams = {}) {
  const response = await api.get(ENDPOINTS.states, { params });
  return unwrapList<State>(response);
}

export async function createState(payload: StateFormValues) {
  const response = await api.post(ENDPOINTS.states, payload);
  return unwrap<State>(response);
}

export async function updateState(
  id: string,
  payload: Partial<StateFormValues> & { isActive?: boolean },
) {
  const response = await api.patch(`${ENDPOINTS.states}/${id}`, payload);
  return unwrap<State>(response);
}

export async function deleteState(id: string) {
  const response = await api.delete(`${ENDPOINTS.states}/${id}`);
  return unwrap<unknown>(response);
}

// Districts
export async function getDistricts(params: DistrictListParams = {}) {
  const response = await api.get(ENDPOINTS.districts, { params });
  return unwrapList<District>(response);
}

export async function createDistrict(payload: DistrictFormValues) {
  const response = await api.post(ENDPOINTS.districts, payload);
  return unwrap<District>(response);
}

export async function updateDistrict(
  id: string,
  payload: Partial<DistrictFormValues> & { isActive?: boolean },
) {
  const response = await api.patch(`${ENDPOINTS.districts}/${id}`, payload);
  return unwrap<District>(response);
}

export async function deleteDistrict(id: string) {
  const response = await api.delete(`${ENDPOINTS.districts}/${id}`);
  return unwrap<unknown>(response);
}

// Talukas — paginated response
export interface PaginatedTalukas {
  talukas: Taluka[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getTalukas(params: TalukaListParams = {}): Promise<PaginatedTalukas> {
  const response = await api.get(ENDPOINTS.talukas, { params });
  const result = unwrap<any>(response);

  // Fail clearly if the API response shape is unexpected.
  // Returning an empty list silently could hide a backend/API issue.
  if (!result || !Array.isArray(result.talukas)) {
    throw new Error("Unexpected response while loading Talukas.");
  }

  const total = Number(result.total ?? 0);
  const page = Number(result.page ?? params.page ?? 1);
  const limit = Number(result.limit ?? params.limit ?? 10);
  const totalPages = Number(result.totalPages ?? (limit > 0 ? Math.ceil(total / limit) : 0));

  if (
    !Number.isFinite(total) ||
    !Number.isFinite(page) ||
    !Number.isFinite(limit) ||
    !Number.isFinite(totalPages) ||
    total < 0 ||
    page < 1 ||
    limit < 1 ||
    totalPages < 0
  ) {
    throw new Error("Invalid pagination metadata returned for Talukas.");
  }

  return {
    talukas: result.talukas as Taluka[],
    total,
    page,
    limit,
    totalPages,
  };
}

export async function createTaluka(payload: TalukaFormValues) {
  const response = await api.post(ENDPOINTS.talukas, payload);
  return unwrap<Taluka>(response);
}

export async function updateTaluka(
  id: string,
  payload: Partial<TalukaFormValues> & { isActive?: boolean },
) {
  const response = await api.patch(`${ENDPOINTS.talukas}/${id}`, payload);
  return unwrap<Taluka>(response);
}

export async function deleteTaluka(id: string) {
  const response = await api.delete(`${ENDPOINTS.talukas}/${id}`);
  return unwrap<unknown>(response);
}

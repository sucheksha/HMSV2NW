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

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  [key: string]: unknown;
}

export interface PaginatedStates extends PaginatedResponse<State> {
  states: State[];
}

export interface PaginatedDistricts extends PaginatedResponse<District> {
  districts: District[];
}

export interface PaginatedTalukas extends PaginatedResponse<Taluka> {
  talukas: Taluka[];
}

function unwrap<T>(response: any): T {
  return response?.data?.data ?? response?.data;
}

function getPaginationMetadata(result: any, params: { page?: number; limit?: number }) {
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
    throw new Error("Invalid pagination metadata returned by the server.");
  }

  return { total, page, limit, totalPages };
}

function normalizeList<T>(
  result: any,
  key: "states" | "districts" | "talukas",
  params: { page?: number; limit?: number },
) {
  if (!result || !Array.isArray(result[key])) {
    throw new Error(`Unexpected response while loading ${key}.`);
  }

  return {
    [key]: result[key] as T[],
    ...getPaginationMetadata(result, params),
  };
}

// States: paginated table request
export async function getStates(params: LocationListParams = {}): Promise<PaginatedStates> {
  const response = await api.get(ENDPOINTS.states, { params });
  return normalizeList<State>(unwrap<any>(response), "states", params) as PaginatedStates;
}

// Load all State options for dropdowns.
// Requests are still limited to 100 records per API call.
export async function getAllStates(): Promise<State[]> {
  const firstPage = await getStates({
    page: 1,
    limit: 100,
    sortBy: "name",
    sortOrder: "asc",
  });

  const states = [...firstPage.states];

  for (let page = 2; page <= firstPage.totalPages; page += 1) {
    const result = await getStates({
      page,
      limit: 100,
      sortBy: "name",
      sortOrder: "asc",
    });

    states.push(...result.states);
  }

  return states;
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

// Districts: paginated table request
export async function getDistricts(params: DistrictListParams = {}): Promise<PaginatedDistricts> {
  const response = await api.get(ENDPOINTS.districts, { params });
  return normalizeList<District>(unwrap<any>(response), "districts", params) as PaginatedDistricts;
}

// Load all District options for dropdowns.
export async function getAllDistricts(): Promise<District[]> {
  const firstPage = await getDistricts({
    page: 1,
    limit: 100,
    sortBy: "name",
    sortOrder: "asc",
  });

  const districts = [...firstPage.districts];

  for (let page = 2; page <= firstPage.totalPages; page += 1) {
    const result = await getDistricts({
      page,
      limit: 100,
      sortBy: "name",
      sortOrder: "asc",
    });

    districts.push(...result.districts);
  }

  return districts;
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

// Talukas: paginated table request
export async function getTalukas(params: TalukaListParams = {}): Promise<PaginatedTalukas> {
  const response = await api.get(ENDPOINTS.talukas, { params });
  return normalizeList<Taluka>(unwrap<any>(response), "talukas", params) as PaginatedTalukas;
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

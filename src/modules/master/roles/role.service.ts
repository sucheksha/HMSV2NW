import api from "@/services/api";

import type {
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  RoleListQuery,
  RoleListResponse,
  RoleResponse,
  RoleDeleteResponse,
} from "./role.types";

/**
 * Get roles using server-side pagination, search, sorting, and filters.
 */
export const getRoles = async (params: RoleListQuery = {}): Promise<RoleListResponse> => {
  const response = await api.get<RoleListResponse>("/master/roles", {
    params,
  });

  return response.data;
};

/**
 * Get a single role by its MongoDB ID.
 */
export const getRoleById = async (roleId: string): Promise<Role> => {
  const response = await api.get<RoleResponse>(`/master/roles/${roleId}`);

  return response.data.data;
};

/**
 * Create a new role.
 */
export const createRole = async (data: CreateRoleRequest): Promise<RoleResponse> => {
  const response = await api.post<RoleResponse>("/master/roles", data);

  return response.data;
};

/**
 * Update an existing role.
 */
export const updateRole = async (
  roleId: string,
  data: UpdateRoleRequest,
): Promise<RoleResponse> => {
  const response = await api.patch<RoleResponse>(`/master/roles/${roleId}`, data);

  return response.data;
};

/**
 * Soft-delete a role.
 */
export const deleteRole = async (roleId: string): Promise<{ message: string }> => {
  const response = await api.delete<RoleDeleteResponse>(`/master/roles/${roleId}`);

  return {
    message: response.data.message,
  };
};

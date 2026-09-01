import api from "@/services/api";

import type { Department } from "./department.types";
export type DepartmentListResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: Department[];
  errors: string[];
};

export type DepartmentResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: Department;
  errors: string[];
};

export type CreateDepartmentRequest = {
  departmentName: string;
  departmentCode: string;
  staffCount?: number | null;
  floor?: string | null;
  roomNumber?: string | null;
  departmentHead?: string | null;
  description?: string | null;
};

export type UpdateDepartmentRequest = {
  departmentName?: string;
  departmentCode?: string;
  staffCount?: number | null;
  floor?: string | null;
  roomNumber?: string | null;
  departmentHead?: string | null;
  description?: string | null;
  status?: "ACTIVE" | "INACTIVE";
};
// Get all departments
export const getDepartments = async (): Promise<Department[]> => {
  const response = await api.get<DepartmentListResponse>("/master/departments");
  return response.data.data;
};
// Get one department
export const getDepartmentById = async (departmentId: string): Promise<Department> => {
  const response = await api.get<DepartmentResponse>(`/master/departments/${departmentId}`);
  return response.data.data;
};
//Create department
export const createDepartment = async (data: CreateDepartmentRequest): Promise<Department> => {
  const response = await api.post<DepartmentResponse>("/master/departments", data);
  return response.data.data;
};
// Update department
export const updateDepartment = async (
  departmentId: string,
  data: UpdateDepartmentRequest,
): Promise<Department> => {
  const response = await api.patch<DepartmentResponse>(`/master/departments/${departmentId}`, data);
  return response.data.data;
};
// Delete department
export const deleteDepartment = async (departmentId: string): Promise<void> => {
  await api.delete(`/master/departments/${departmentId}`);
};

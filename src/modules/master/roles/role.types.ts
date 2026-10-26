export type RoleStatus = "ACTIVE" | "INACTIVE";

export interface Role {
  _id: string;
  roleId: string;
  roleName: string;
  departmentCategory: string;
  description?: string | null;
  hospitalId: string;
  status: RoleStatus;
  createdBy?: string | null;
  updatedBy?: string | null;
  deletedBy?: string | null;
  deletedAt?: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateRoleRequest = {
  roleName: string;
  departmentCategory: string;
  description?: string | null;
};

export type UpdateRoleRequest = {
  roleName?: string;
  departmentCategory?: string;
  description?: string | null;
  status?: RoleStatus;
};

export interface RolePagination {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface RoleListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: RoleStatus;
  departmentCategory?: string;
  sortBy?: "roleId" | "roleName" | "departmentCategory" | "status" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface RoleListData {
  roles: Role[];
  pagination: RolePagination;
}

export interface RoleListResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: RoleListData;
  errors: string[];
}

export interface RoleResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Role;
  errors: string[];
}

export interface RoleDeleteResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: unknown;
  errors: string[];
}

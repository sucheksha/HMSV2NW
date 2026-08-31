export type DepartmentStatus = "ACTIVE" | "INACTIVE";

export interface Department {
  _id: string;
  departmentName: string;
  departmentCode: string;
  hospitalId: string;
  status: DepartmentStatus;

  createdBy: string;
  updatedBy: string | null;
  deletedBy: string | null;
  deletedAt: string | null;

  createdAt: string;
  updatedAt: string;
}

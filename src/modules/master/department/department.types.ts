export type DepartmentStatus = "ACTIVE" | "INACTIVE";
export interface Department {
  _id: string;
  departmentName: string;
  departmentCode: string;
  hospitalId: string;
  status: DepartmentStatus;
  staffCount?: number | null;
  floor?: string | null;
  roomNumber?: string | null;
  departmentHead?: string | null;
  description?: string | null;
  createdBy: string;
  updatedBy: string | null;
  deletedBy: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

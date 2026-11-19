
export type ModalityStatus = "ACTIVE" | "INACTIVE";

export interface Modality {
  _id: string;
  modalityName: string;
  modalityCode: string;
  description?: string;
  hospitalId: string;
  status: ModalityStatus;
  createdBy?: string;
  updatedBy?: string | null;
  deletedBy?: string | null;
  deletedAt?: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateModalityRequest {
  modalityName: string;
  modalityCode: string;
  description?: string;
  status?: ModalityStatus;
}

export interface UpdateModalityRequest {
  modalityName?: string;
  modalityCode?: string;
  description?: string;
  status?: ModalityStatus;
}

export interface ModalityQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ModalityStatus;
  sortBy?: "modalityName" | "modalityCode" | "status" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export interface ModalityListData {
  modalities: Modality[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  errors: string[];
}

export interface InvestigationModality {
  _id: string;
  modalityName: string;
  modalityCode: string;
}

export interface ImagingInvestigation {
  _id: string;
  investigationName: string;
  investigationCode: string;
  loincCode?: string | null;
  category: string;
  type: string;
  sampleType?: string | null;
  turnaroundTime?: number | null;
  description?: string | null;
  modalityId?: string | InvestigationModality | null;
  hospitalId: string;
  status: ModalityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface InvestigationPagination {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface InvestigationStats {
  totalInvestigations: number;
  activeInvestigations: number;
  inactiveInvestigations: number;
  totalSampleTypes: number;
}

export interface ImagingInvestigationListData {
  investigations: ImagingInvestigation[];
  pagination: InvestigationPagination;
  stats: InvestigationStats;
}

export interface ImagingInvestigationQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  modalityId?: string;
  category?: string;
  type?: string;
  sampleType?: string;
  status?: ModalityStatus;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

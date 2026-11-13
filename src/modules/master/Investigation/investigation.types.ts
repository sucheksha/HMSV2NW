export type InvestigationStatus = "ACTIVE" | "INACTIVE";

export interface InvestigationModality {
  _id: string;
  modalityName: string;
  modalityCode: string;
}

export interface Investigation {
  _id: string;
  investigationName: string;
  investigationCode: string;
  loincCode?: string | null;
  category: string;
  type: string;
  sampleType?: string | null;
  turnaroundTime?: number | null;
  description?: string | null;

  // Existing records may have null; populated records return an object.
  modalityId?: string | InvestigationModality | null;

  hospitalId: string;
  status: InvestigationStatus;
  createdBy: string;
  updatedBy?: string | null;
  deletedBy?: string | null;
  deletedAt?: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateInvestigationRequest = {
  investigationName: string;
  investigationCode: string;
  loincCode?: string | null;
  category: string;
  type: string;
  sampleType?: string | null;
  turnaroundTime?: number | null;
  description?: string | null;
  modalityId?: string | null;
};

export type UpdateInvestigationRequest = {
  investigationName?: string;
  investigationCode?: string;
  loincCode?: string | null;
  category?: string;
  type?: string;
  sampleType?: string | null;
  turnaroundTime?: number | null;
  description?: string | null;
  status?: InvestigationStatus;
  modalityId?: string | null;
};

export interface InvestigationPagination {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface InvestigationListData {
  investigations: Investigation[];
  pagination: InvestigationPagination;
}

export type InvestigationListResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: InvestigationListData;
  errors: string[];
};

export type InvestigationResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: Investigation;
  errors: string[];
};

export interface InvestigationQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  type?: string;
  status?: InvestigationStatus;
  modalityId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

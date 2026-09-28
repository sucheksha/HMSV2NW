export type InvestigationStatus = "ACTIVE" | "INACTIVE";

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
};

export type InvestigationListResponse = {
  success: boolean;

  statusCode: number;

  message: string;

  data: Investigation[];

  errors: string[];
};

export type InvestigationResponse = {
  success: boolean;

  statusCode: number;

  message: string;

  data: Investigation;

  errors: string[];
};

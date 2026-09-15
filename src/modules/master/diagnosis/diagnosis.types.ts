export type DiagnosisStatus = "ACTIVE" | "INACTIVE";

export interface Diagnosis {
  _id: string;
  diagnosisName: string;
  diagnosisCode: string;
  diagnosisCategory?: string | null;
  diagnosisType?: string | null;
  icdCode?: string | null;
  icdVersion?: string | null;
  shortName?: string | null;
  description?: string | null;
  hospitalId: string;
  status: DiagnosisStatus;
  createdBy: string;
  updatedBy?: string | null;
  deletedBy?: string | null;
  deletedAt?: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateDiagnosisRequest = {
  diagnosisName: string;
  diagnosisCode: string;
  diagnosisCategory?: string | null;
  diagnosisType?: string | null;
  icdCode?: string | null;
  icdVersion?: string | null;
  shortName?: string | null;
  description?: string | null;
};

export type UpdateDiagnosisRequest = {
  diagnosisName?: string;
  diagnosisCode?: string;
  diagnosisCategory?: string | null;
  diagnosisType?: string | null;
  icdCode?: string | null;
  icdVersion?: string | null;
  shortName?: string | null;
  description?: string | null;
  status?: DiagnosisStatus;
};

export type DiagnosisListResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: Diagnosis[];
  errors: string[];
};

export type DiagnosisResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: Diagnosis;
  errors: string[];
};

import api from "@/services/api";
import type {
  Diagnosis,
  CreateDiagnosisRequest,
  UpdateDiagnosisRequest,
  DiagnosisListResponse,
  DiagnosisResponse,
} from "./diagnosis.types";

export const getDiagnoses = async (): Promise<Diagnosis[]> => {
  const response = await api.get<DiagnosisListResponse>("/master/diagnosis");

  return response.data.data;
};

export const getDiagnosisById = async (diagnosisId: string): Promise<Diagnosis> => {
  const response = await api.get<DiagnosisResponse>(`/master/diagnosis/${diagnosisId}`);

  return response.data.data;
};

export const createDiagnosis = async (data: CreateDiagnosisRequest): Promise<DiagnosisResponse> => {
  const response = await api.post<DiagnosisResponse>("/master/diagnosis", data);

  return response.data;
};

export const updateDiagnosis = async (
  diagnosisId: string,
  data: UpdateDiagnosisRequest,
): Promise<DiagnosisResponse> => {
  const response = await api.patch<DiagnosisResponse>(`/master/diagnosis/${diagnosisId}`, data);

  return response.data;
};

export const deleteDiagnosis = async (diagnosisId: string): Promise<{ message: string }> => {
  const response = await api.delete<{
    success: boolean;
    statusCode: number;
    message: string;
    data: unknown;
    errors: string[];
  }>(`/master/diagnosis/${diagnosisId}`);

  return {
    message: response.data.message,
  };
};

import api from "@/services/api";
import type {
  Investigation,
  CreateInvestigationRequest,
  UpdateInvestigationRequest,
  InvestigationListResponse,
  InvestigationResponse,
} from "./investigation.types";

export const getInvestigations = async (): Promise<Investigation[]> => {
  const response = await api.get<InvestigationListResponse>("/master/investigations");

  return response.data.data;
};

export const getInvestigationById = async (investigationId: string): Promise<Investigation> => {
  const response = await api.get<InvestigationResponse>(
    `/master/investigations/${investigationId}`,
  );

  return response.data.data;
};

export const createInvestigation = async (
  data: CreateInvestigationRequest,
): Promise<InvestigationResponse> => {
  const response = await api.post<InvestigationResponse>("/master/investigations", data);

  return response.data;
};

export const updateInvestigation = async (
  investigationId: string,
  data: UpdateInvestigationRequest,
): Promise<InvestigationResponse> => {
  const response = await api.patch<InvestigationResponse>(
    `/master/investigations/${investigationId}`,
    data,
  );

  return response.data;
};

export const deleteInvestigation = async (
  investigationId: string,
): Promise<{ message: string }> => {
  const response = await api.delete<{
    success: boolean;
    statusCode: number;
    message: string;
    data: unknown;
    errors: string[];
  }>(`/master/investigations/${investigationId}`);

  return {
    message: response.data.message,
  };
};

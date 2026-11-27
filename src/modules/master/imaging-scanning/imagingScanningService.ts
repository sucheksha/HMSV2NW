import api from "@/services/api";

import type {
  ApiResponse,
  Modality,
  ModalityListData,
  ModalityQueryParams,
  CreateModalityRequest,
  UpdateModalityRequest,
  ImagingInvestigation,
  ImagingInvestigationListData,
  ImagingInvestigationQueryParams,
} from "./imagingScanning.types";

// ============================================
// MODALITY MASTER
// ============================================

export const getModalities = async (
  params: ModalityQueryParams = {},
): Promise<ModalityListData> => {
  const page = Math.max(1, Math.floor(Number(params.page) || 1));
  const limit = Math.min(100, Math.max(1, Math.floor(Number(params.limit) || 10)));

  const response = await api.get<ApiResponse<ModalityListData>>("/master/modalities", {
    params: {
      ...params,
      page,
      limit,
    },
  });

  return response.data.data;
};

export const getModalityById = async (modalityId: string): Promise<Modality> => {
  const response = await api.get<ApiResponse<Modality>>(`/master/modalities/${modalityId}`);

  return response.data.data;
};

export const createModality = async (data: CreateModalityRequest): Promise<Modality> => {
  const response = await api.post<ApiResponse<Modality>>("/master/modalities", data);

  return response.data.data;
};

export const updateModality = async (
  modalityId: string,
  data: UpdateModalityRequest,
): Promise<Modality> => {
  const response = await api.patch<ApiResponse<Modality>>(`/master/modalities/${modalityId}`, data);

  return response.data.data;
};

export const deleteModality = async (modalityId: string): Promise<void> => {
  await api.delete(`/master/modalities/${modalityId}`);
};

// ============================================
// IMAGING INVESTIGATIONS
// Uses the existing Investigation collection.
// ============================================

export const getImagingInvestigations = async (
  params: ImagingInvestigationQueryParams = {},
): Promise<ImagingInvestigationListData> => {
  const page = Math.max(1, Math.floor(Number(params.page) || 1));
  const limit = Math.min(100, Math.max(1, Math.floor(Number(params.limit) || 10)));

  const response = await api.get<ApiResponse<ImagingInvestigationListData>>(
    "/master/investigations",
    {
      params: {
        ...params,
        page,
        limit,
      },
    },
  );

  return response.data.data;
};

export const getImagingInvestigationById = async (
  investigationId: string,
): Promise<ImagingInvestigation> => {
  const response = await api.get<ApiResponse<ImagingInvestigation>>(
    `/master/investigations/${investigationId}`,
  );

  return response.data.data;
};

import api from "@/services/api";

// ==========================================
// Hospital Address
// ==========================================

export interface HospitalAddress {
  line1: string;
  line2: string;
  city: string;
  district?: string;
  state: string;
  country: string;
  pincode: string;
}

// ==========================================
// Subscription Modules
// Matches hospital.model.js exactly
// ==========================================

export interface HospitalModules {
  patients: boolean;
  appointments: boolean;
  opd: boolean;
  ipd: boolean;
  laboratory: boolean;
  pharmacy: boolean;
  inventory: boolean;
  diagnosis: boolean;
  billing: boolean;
  expenses: boolean;
  reports: boolean;
  analytics: boolean;
  staff: boolean;
  doctors: boolean;
  departments: boolean;
  wards: boolean;
  rooms: boolean;
  beds: boolean;
  masterData: boolean;
}

// ==========================================
// Subscription Limits
// Matches hospital.model.js exactly
// ==========================================

export interface HospitalSubscriptionLimits {
  maxStaff: number | null;
  maxDoctors: number | null;
  maxPatients: number | null;
  maxStorage: number | null;
}

// ==========================================
// Hospital Subscription
// Matches hospital.model.js exactly
// ==========================================
//
// NOTE:
// There is NO "plan" field in the backend
// Hospital schema, so it is intentionally
// not included here.
// ==========================================

export interface HospitalSubscription {
  status: "ACTIVE" | "INACTIVE" | "EXPIRED" | "SUSPENDED" | null;

  startDate: string | null;

  endDate: string | null;

  modules: HospitalModules;

  limits: HospitalSubscriptionLimits;
}

// ==========================================
// Hospital Profile
// Matches hospital.model.js exactly
// ==========================================

export interface HospitalProfile {
  _id: string;

  hospitalId: string;

  hospitalName: string;

  hospitalCode: string;

  hospitalType: "PRIVATE" | "GOVERNMENT" | "TRUST" | "CORPORATE";

  registrationNumber: string;
  registrationCertificate?: string | null;
  registrationDate?: string | null;
  registrationExpiryDate?: string | null;
  verificationStatus?: "PENDING" | "VERIFIED" | "REJECTED";

  establishedDate: string | null;
  description?: string;
  email: string;

  phone: string;

  telephone: string;

  website: string;
  googleMaps?: string;
  address: HospitalAddress;

  logo: string | null;
  nabhAccredited: boolean;
  nabhNumber?: string;
  subscription: HospitalSubscription;

  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";

  createdBy: string;

  updatedBy: string | null;

  deletedBy: string | null;

  deletedAt: string | null;

  isDeleted: boolean;
}

// ==========================================
// API Response
// Matches sendResponse structure
// ==========================================

interface HospitalProfileResponse {
  success: boolean;

  statusCode: number;

  message: string;

  data: HospitalProfile;

  errors: string[];
}

// ==========================================
// Update Hospital Profile Request
// Matches updateHospitalProfileValidation
// AND hospital.service.js allowedFields
// ==========================================
//
// Hospital Admin can update ONLY these fields.
//
// Not included:
// - hospitalId
// - hospitalCode
// - hospitalType
// - subscription
// - status
// - audit fields
// ==========================================

export interface UpdateHospitalProfileRequest {
  hospitalName?: string;

  registrationNumber?: string;

  establishedDate?: string | null;

  email?: string;

  phone?: string;

  telephone?: string;

  website?: string;

  address?: HospitalAddress;

  logo?: string | null;
}

// ==========================================
// Get Hospital Profile
// Hospital Admin
// ==========================================
//
// GET /api/hospitals/profile
// ==========================================

export const getHospitalProfile = async (): Promise<HospitalProfile> => {
  const response = await api.get("/hospitals/profile");

  return response.data.data;
};

// ==========================================
// Update Hospital Profile
// Hospital Admin
// ==========================================
export interface UpdateHospitalProfilePayload {
  hospitalName?: string;
  hospitalType?: "PRIVATE" | "GOVERNMENT" | "TRUST" | "CORPORATE";

  establishedDate?: string | null;
  description?: string;

  email?: string;
  phone?: string;
  telephone?: string;
  website?: string;
  googleMaps?: string;

  address?: Partial<HospitalAddress>;

  registrationNumber?: string;
  registrationCertificate?: string | null;
  registrationDate?: string | null;
  registrationExpiryDate?: string | null;

  logo?: string | null;

  nabhAccredited?: boolean;
  nabhNumber?: string;
}

// PUT /api/hospitals/profile
// ==========================================

export const updateHospitalProfile = async (
  data: UpdateHospitalProfilePayload,
): Promise<HospitalProfile> => {
  const response = await api.put("/hospitals/profile", data);

  return response.data.data;
};

// ==========================================
// Update Hospital Subscription Request
// Super Admin
// ==========================================
//
// Matches the backend subscription route:
//
// PUT /api/hospitals/:hospitalId/subscription
//
// NOTE:
// The backend Joi validation currently supports
// only the 10 modules listed below, even though
// hospital.model.js contains 19 modules.
//
// We are therefore keeping this interface aligned
// with the CURRENT backend validation.
// ==========================================

export interface UpdateSubscriptionRequest {
  status: "ACTIVE" | "INACTIVE" | "EXPIRED" | "SUSPENDED";

  startDate?: string | null;

  endDate?: string | null;

  modules?: Partial<{
    patients: boolean;
    appointments: boolean;
    opd: boolean;
    ipd: boolean;
    laboratory: boolean;
    pharmacy: boolean;
    billing: boolean;
    inventory: boolean;
    reports: boolean;
    analytics: boolean;
  }>;

  limits?: Partial<HospitalSubscriptionLimits>;
}

// ==========================================
// Update Hospital Subscription
// Super Admin
// ==========================================
//
// PUT /api/hospitals/:hospitalId/subscription
// ==========================================

export const updateHospitalSubscription = async (
  hospitalId: string,
  data: UpdateSubscriptionRequest,
): Promise<HospitalProfile> => {
  const response = await api.put<HospitalProfileResponse>(
    `/hospitals/${hospitalId}/subscription`,
    data,
  );

  return response.data.data;
};

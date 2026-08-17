import { useEffect, useState } from "react";
import api from "@/services/api";

export interface HospitalAddress {
  line1: string;
  line2: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

export interface HospitalSubscriptionLimits {
  maxStaff: number | null;
  maxDoctors: number | null;
  maxPatients: number | null;
  maxStorage: number | null;
}

export interface HospitalSubscription {
  plan: "BASIC" | "STANDARD" | "PROFESSIONAL" | "ENTERPRISE" | null;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED" | "SUSPENDED" | null;
  startDate: string | null;
  endDate: string | null;
  limits: HospitalSubscriptionLimits;
}

export interface HospitalProfile {
  _id: string;
  hospitalId: string;
  hospitalName: string;
  hospitalCode: string;
  hospitalType: "PRIVATE" | "GOVERNMENT" | "TRUST" | "CORPORATE";
  registrationNumber: string;
  establishedDate: string | null;

  email: string;
  phone: string;
  telephone: string;
  website: string;

  address: HospitalAddress;

  logo: string | null;

  subscription: HospitalSubscription;

  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";

  createdBy: string;
  updatedBy: string | null;

  createdAt?: string;
  updatedAt?: string;
}

interface HospitalProfileResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: HospitalProfile;
  errors: string[];
}

interface UpdateHospitalProfileRequest {
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

/**
 * Get logged-in hospital profile
 */
export const getHospitalProfile = async (): Promise<HospitalProfile> => {
  const response = await api.get<HospitalProfileResponse>("/hospitals/profile");

  return response.data.data;
};

/**
 * Update hospital profile
 *
 * Hospital Admin can update profile information only.
 * Subscription is intentionally NOT included here.
 */
export const updateHospitalProfile = async (
  data: UpdateHospitalProfileRequest,
): Promise<HospitalProfile> => {
  const response = await api.put<HospitalProfileResponse>("/hospitals/profile", data);

  return response.data.data;
};

/**
 * React hook for hospital profile
 */
export function useHospitalProfile() {
  const [profile, setProfile] = useState<HospitalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getHospitalProfile();

      setProfile(data);
    } catch (err) {
      console.error("Failed to load hospital profile:", err);
      setError("Unable to load hospital profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    setProfile,
    loading,
    error,
    refresh: fetchProfile,
  };
}

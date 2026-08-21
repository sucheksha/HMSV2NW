import api from "@/services/api";

export type SubscriptionPlan =
  | "STARTER"
  | "PROFESSIONAL"
  | "ENTERPRISE";

export type SubscriptionModule = {
  patients?: boolean;
  appointments?: boolean;
  opd?: boolean;
  ipd?: boolean;
  laboratory?: boolean;
  pharmacy?: boolean;
  inventory?: boolean;
  diagnosis?: boolean;
  billing?: boolean;
  expenses?: boolean;
  reports?: boolean;
  analytics?: boolean;
  staff?: boolean;
  doctors?: boolean;
  departments?: boolean;
  wards?: boolean;
  rooms?: boolean;
  beds?: boolean;
  masterData?: boolean;
};

export type SubscriptionLimits = {
  maxStaff?: number | null;
  maxDoctors?: number | null;
  maxPatients?: number | null;
  maxStorage?: number | null;
};

export type Subscription = {
  plan: SubscriptionPlan | null;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED" | "SUSPENDED" | null;
  startDate: string | null;
  endDate: string | null;
    updatedAt: string | null;
  modules: SubscriptionModule;
  limits: SubscriptionLimits;
};

export type SubscriptionResponse = {
  hospitalId: string;
  hospitalName: string;
  subscription: Subscription | null;
};

/**
 * Get the subscription of a hospital.
 *
 * Hospital Admin:
 * - Can only retrieve their own hospital subscription.
 *
 * Super Admin:
 * - Can retrieve the subscription of the hospital they are working with.
 */
export async function getSubscription(
  hospitalId: string,
): Promise<SubscriptionResponse> {
  const response = await api.get(
    `/hospitals/${hospitalId}/subscription`,
  );

  return response.data.data;
}

/**
 * Payload sent when Super Admin changes a hospital subscription.
 *
 * The backend replaces the complete subscription object,
 * so the existing subscription information should be sent
 * together with the new plan.
 */
export type UpdateSubscriptionPayload = {
  plan: SubscriptionPlan;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED" | "SUSPENDED";
  startDate?: string | null;
  endDate?: string | null;
  modules?: SubscriptionModule;
  limits?: SubscriptionLimits;
};

/**
 * Update hospital subscription.
 *
 * Only SUPER_ADMIN is authorized by the backend route.
 */
export async function updateSubscription(
  hospitalId: string,
  data: UpdateSubscriptionPayload,
): Promise<SubscriptionResponse> {
  const response = await api.put(
    `/hospitals/${hospitalId}/subscription`,
    data,
  );

  return response.data.data;
}
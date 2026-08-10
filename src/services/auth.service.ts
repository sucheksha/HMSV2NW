import api from "./api";

// ==========================================
// Login
// ==========================================

export interface LoginRequest {
  loginId: string;
  password: string;
}

// Staff information returned by backend
export interface Staff {
  _id: string;
  employeeId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  displayName: string;
  email: string;
  mobileNumber: string;
  role: string;
  hospitalId: string | null;
  status: string;
}

// Login data returned inside backend "data"
// {
//   staff: {...},
//   token: "..."
// }
export interface LoginData {
  staff: Staff;
  token: string;
}

// Complete backend response
export interface LoginResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: LoginData;
  errors: string[];
}

// Login API
export const login = async (data: LoginRequest): Promise<LoginData> => {
  const response = await api.post<LoginResponse>("/auth/login", data);

  // Backend response:
  //
  // {
  //   success: true,
  //   statusCode: 200,
  //   message: "Login Successful.",
  //   data: {
  //     staff: {...},
  //     token: "..."
  //   },
  //   errors: []
  // }
  //
  // Return only the inner "data"
  // so auth.tsx can do:
  //
  // const { staff, token } = response;

  return response.data.data;
};

// ==========================================
// Logout
// ==========================================

export interface LogoutResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    message: string;
  } | null;
  errors: string[];
}

export const logout = async (): Promise<LogoutResponse> => {
  const response = await api.post<LogoutResponse>("/auth/logout");

  return response.data;
};

// ==========================================
// Forgot Password
// ==========================================

export interface ForgotPasswordRequest {
  loginId: string;
}

export interface CommonAuthResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: null;
  errors: string[];
}

export const forgotPassword = async (data: ForgotPasswordRequest): Promise<CommonAuthResponse> => {
  const response = await api.post<CommonAuthResponse>("/auth/forgot-password", data);

  return response.data;
};

// ==========================================
// Verify OTP
// ==========================================

export interface VerifyOtpRequest {
  loginId: string;
  otp: string;
}

export const verifyOtp = async (data: VerifyOtpRequest): Promise<CommonAuthResponse> => {
  const response = await api.post<CommonAuthResponse>("/auth/verify-otp", data);

  return response.data;
};

// ==========================================
// Change Password
// ==========================================

export interface ChangePasswordRequest {
  loginId: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const changePassword = async (data: ChangePasswordRequest): Promise<CommonAuthResponse> => {
  const response = await api.post<CommonAuthResponse>("/auth/change-password", data);

  return response.data;
};

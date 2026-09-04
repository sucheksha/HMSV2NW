import type { AxiosError } from "axios";

interface ApiErrorResponse {
  success?: boolean;
  statusCode?: number;
  message?: string;
  errors?: string[];
}

export const getApiErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string => {
  const axiosError = error as AxiosError<ApiErrorResponse>;

  // Network error / server unreachable
  if (!axiosError.response) {
    return "Unable to connect to the server. Please check your network connection and try again.";
  }

  const status = axiosError.response.status;
  const backendMessage = axiosError.response.data?.message;

  // Permission denied
  if (status === 403) {
    return backendMessage || "You don't have permission to perform this action.";
  }

  // Validation / bad request
  if (status === 400 || status === 422) {
    return backendMessage || "Please correct the highlighted fields.";
  }

  // Not found
  if (status === 404) {
    return backendMessage || "The requested information could not be found.";
  }

  // Conflict
  if (status === 409) {
    return backendMessage || "This information already exists.";
  }

  // Server error
  if (status >= 500) {
    return backendMessage || "The server is currently unavailable. Please try again later.";
  }

  // Use backend message if available
  return backendMessage || fallback;
};

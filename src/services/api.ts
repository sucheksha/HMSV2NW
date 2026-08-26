import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
const api: AxiosInstance = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});
// Request Interceptor, Automatically attach Access Token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("jeevix.auth.token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
// Response Interceptor, Refresh Access Token when it expires
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};
api.interceptors.response.use(
  // Successful response
  (response) => {
    return response;
  },
  // Failed response
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    // Only handle 401 errors
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }
    // Do not try to refresh the refresh request itself
    if (originalRequest.url?.includes("/auth/refresh")) {
      localStorage.removeItem("jeevix.auth.token");
      localStorage.removeItem("jeevix.auth.refreshToken");
      window.location.href = "/login";
      return Promise.reject(error);
    }
    // Prevent infinite retry loop
    if (originalRequest._retry) {
      localStorage.removeItem("jeevix.auth.token");
      localStorage.removeItem("jeevix.auth.refreshToken");
      window.location.href = "/login";
      return Promise.reject(error);
    }
    originalRequest._retry = true;
    // If another request is already refreshing,wait for that refresh request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }
    isRefreshing = true;
    try {
      const refreshToken = localStorage.getItem("jeevix.auth.refreshToken");
      if (!refreshToken) {
        throw new Error("Refresh token not found.");
      }
      // Request new Access Token
      const response = await axios.post("http://localhost:5000/api/auth/refresh", {
        refreshToken,
      });
      const newToken = response.data.data.token;
      // Store New Access Token
      localStorage.setItem("jeevix.auth.token", newToken);
      // Resolve queued requests
      processQueue(null, newToken);
      // Retry Original Request
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      // Refresh token is invalid/expired/revoked
      localStorage.removeItem("jeevix.auth.token");
      localStorage.removeItem("jeevix.auth.refreshToken");
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
export default api;

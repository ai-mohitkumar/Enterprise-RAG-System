/**
 * API client and configuration
 */

import axios, { AxiosError, AxiosInstance } from "axios";
import { ApiError } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const API_TIMEOUT = 30000;

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      // Token expired, clear and redirect to login
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

/**
 * Formatted API error
 */
export class ApiErrorHandler {
  static handle(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data;
      if (data && typeof data === "object" && "error" in data) {
        return data as ApiError;
      }
      return {
        error: error.message,
        status_code: error.response?.status || 500,
        timestamp: new Date().toISOString(),
      };
    }
    return {
      error: "An unexpected error occurred",
      status_code: 500,
      timestamp: new Date().toISOString(),
    };
  }
}

export default apiClient;

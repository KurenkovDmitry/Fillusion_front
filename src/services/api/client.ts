import {
  API_AUTH_URL,
  API_SERVICE_URL,
  API_GENERATOR_V2_URL,
} from "@services/api";
import { useTokenStore } from "../../store/tokenStore";
import { AuthService } from "@services/api";

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retry: boolean = false
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // Получаем актуальный токен при каждом запросе
    const token = useTokenStore.getState().token;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      credentials: "include",
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (
          (errorData.message === "authentication required" ||
            errorData.error === "Forbidden") &&
          endpoint !== "/auth/refresh" &&
          !retry
        ) {
          const response = await AuthService.refreshToken();
          if (response.accessToken) {
            useTokenStore.getState().setToken(response.accessToken);
            return this.request(endpoint, options, true);
          }
        }
        throw new Error(
          errorData.message || `HTTP error status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  async downloadFileAsBlob(
    requestId: string,
    projectId: string
  ): Promise<Blob> {
    const url = `${this.baseURL}/datasets/${requestId}/download?project_id=${projectId}`;
    const token = useTokenStore.getState().token;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error status: ${response.status}`);
    }

    return await response.blob();
  }
}

export const apiAuthClient = new ApiClient(API_AUTH_URL);
export const apiServiceClient = new ApiClient(API_SERVICE_URL);
export const apiGeneratorClient = new ApiClient(API_GENERATOR_V2_URL);

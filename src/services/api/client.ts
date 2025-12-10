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
    const token = useTokenStore.getState().token;

    let headers = new Headers(options.headers || {});

    const body = options.body;

    if (
      !headers.has("Content-Type") &&
      !(body instanceof FormData) &&
      body != null
    ) {
      headers.set("Content-Type", "application/json");
    }

    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const config: RequestInit = {
      ...options,
      headers,
      credentials: "include",
    };

    try {
      const response = await fetch(url, { ...config, headers });
      const errorResponseClone = response.clone();
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

        const errorText = await errorResponseClone.text();
        throw new Error(errorText || `HTTP error status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        return await response.json();
      }
      return {} as T;
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
      body: data,
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
    projectId: string,
    url?: string
  ): Promise<Blob> {
    if (!url) {
      url = `${this.baseURL}/datasets/${requestId}/download?project_id=${projectId}`;
    }
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

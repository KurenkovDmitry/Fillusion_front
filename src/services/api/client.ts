import {
  API_AUTH_URL,
  API_SERVICE_URL,
  API_GENERATOR_V2_URL,
} from "@services/api";
import { useTokenStore } from "../../store/tokenStore";

type FailedQueueCallback = (error: Error | null, token: string | null) => void;

let isRefreshing = false;
let failedQueue: FailedQueueCallback[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((callback) => callback(error, token));
  failedQueue = [];
};

const refreshToken = async () => {
  try {
    const response = await fetch(`${API_AUTH_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const tokens = await response.json();
    const newAccessToken = tokens.accessToken;

    useTokenStore.getState().setToken(newAccessToken);
    processQueue(null, newAccessToken);
    return newAccessToken;
  } catch (error) {
    processQueue(error as Error, null);
    useTokenStore.getState().setToken("");
    console.error("Could not refresh token:", error);
    throw error;
  } finally {
    isRefreshing = false;
  }
};

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
    const makeRequest = async (tokenOverride?: string) => {
      const url = `${this.baseURL}${endpoint}`;
      const token = tokenOverride || useTokenStore.getState().token;

      const config: RequestInit = {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        credentials: "include",
        ...options,
      };

      return fetch(url, config);
    };

    try {
      let response = await makeRequest();

      if (response.status === 401 && endpoint !== "/users/auth/refresh") {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push((new_token: any) => {
              makeRequest(new_token).then(resolve).catch(reject);
            });
          }).then((res) => (res as Response).json());
        } else {
          isRefreshing = true;

          const retryOriginalRequest = new Promise((resolve) => {
            failedQueue.push((new_token: any) => {
              resolve(makeRequest(new_token));
            });
          });

          refreshToken();

          return ((await retryOriginalRequest) as Response).json();
        }
      }

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Failed to parse error JSON" }));
        throw new Error(
          errorData.message || `HTTP error status: ${response.status}`
        );
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        return await response.json();
      } else {
        return {} as T;
      }
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
}

export const apiAuthClient = new ApiClient(API_AUTH_URL);
export const apiServiceClient = new ApiClient(API_SERVICE_URL);
export const apiGeneratorClient = new ApiClient(API_GENERATOR_V2_URL);

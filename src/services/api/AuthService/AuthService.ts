// services/api/auth.ts
import { apiClient } from "../client";
import {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UpdateProfileRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthResponse,
} from "./AuthService.types";

export const AuthService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiClient.post<LoginResponse>("/auth/login", credentials);
  },

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    return apiClient.post<RegisterResponse>("/auth/register", userData);
  },

  async getCurrentUser(): Promise<{ user: User }> {
    return apiClient.get<{ user: User }>("/auth/me");
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  },

  async refreshToken(): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/auth/refresh");
  },

  async updateProfile(userData: UpdateProfileRequest): Promise<{ user: User }> {
    return apiClient.put<{ user: User }>("/auth/update", userData);
  },

  async forgotPassword(
    data: ForgotPasswordRequest
  ): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>("/auth/forgot-password", data);
  },

  async resetPassword(
    data: ResetPasswordRequest
  ): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>("/auth/reset-password", data);
  },

  async validateResetToken(token: string): Promise<{ valid: boolean }> {
    return apiClient.get<{ valid: boolean }>(
      `/auth/validate-reset-token/${token}`
    );
  },
};

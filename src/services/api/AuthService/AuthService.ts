// services/api/auth.ts
import { apiAuthClient } from "../client";
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
    return apiAuthClient.post<LoginResponse>("/auth/login", credentials);
  },

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    return apiAuthClient.post<RegisterResponse>("/register", userData);
  },

  async getCurrentUser(): Promise<{ user: User }> {
    return apiAuthClient.get<{ user: User }>("/auth/me");
  },

  async logout(): Promise<void> {
    await apiAuthClient.post("/auth/logout");
  },

  async refreshToken(): Promise<AuthResponse> {
    return apiAuthClient.post<AuthResponse>("/auth/refresh");
  },

  async updateProfile(userData: UpdateProfileRequest): Promise<{ user: User }> {
    return apiAuthClient.put<{ user: User }>("/auth/update", userData);
  },

  async forgotPassword(
    data: ForgotPasswordRequest
  ): Promise<{ message: string }> {
    return apiAuthClient.post<{ message: string }>(
      "/auth/forgot-password",
      data
    );
  },

  async resetPassword(
    data: ResetPasswordRequest
  ): Promise<{ message: string }> {
    return apiAuthClient.post<{ message: string }>(
      "/auth/reset-password",
      data
    );
  },

  async validateResetToken(token: string): Promise<{ valid: boolean }> {
    return apiAuthClient.get<{ valid: boolean }>(
      `/auth/validate-reset-token/${token}`
    );
  },
};

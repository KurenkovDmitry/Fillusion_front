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

  async getCurrentUser(): Promise<User> {
    return apiAuthClient.get<User>("/profile/me");
  },

  async logout(): Promise<void> {
    await apiAuthClient.post("/auth/logout");
  },

  async refreshToken(): Promise<AuthResponse> {
    return apiAuthClient.post<AuthResponse>("/auth/refresh");
  },

  async updateProfile(userData: UpdateProfileRequest): Promise<{ user: User }> {
    const formData = new FormData();

    const { user, avatar } = userData;

    if (user)
      formData.append(
        "user",
        new Blob([JSON.stringify(user)], { type: "application/json" })
      );
    if (avatar) formData.append("avatar", avatar);

    return apiAuthClient.put<{ user: User }>("/profile/update", formData);
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

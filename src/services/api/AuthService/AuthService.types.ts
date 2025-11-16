// services/api/types.ts
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  avatarUrl?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string; // Если используете access token в ответе
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  accessToken: string;
}

export interface AuthResponse {
  accessToken: string;
}

export type UpdateProfileRequest = {
  name?: string;
  avatar?: ArrayBuffer;
};

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
}

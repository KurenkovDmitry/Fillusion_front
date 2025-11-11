// === Очистка базовых URL ===
const sanitizeBaseUrl = (url: string) => url.replace(/\/+$/, "");

// === Автоматическое определение дефолтного URL ===
const getDefaultBaseUrl = () => {
  if (typeof window === "undefined") {
    return "/api/v1";
  }

  const origin = window.location.origin.replace(/\/+$/, "");
  return `${origin}/api/v1`;
};

// === Базовые адреса (с приоритетом .env, иначе fallback на серверный IP) ===

// Основной API (db-service / gateway)
export const API_BASE_URL = sanitizeBaseUrl(
  import.meta.env.VITE_API_BASE_URL ?? "/api/v1"
);

// Auth / user-service
export const API_AUTH_URL = sanitizeBaseUrl(
  import.meta.env.VITE_API_AUTH_URL ?? "/api/users"
);

// Основной backend-сервис
export const API_SERVICE_URL = sanitizeBaseUrl(
  import.meta.env.VITE_API_SERVICE_URL ?? "/api/v1"
);

// === Хранилище токена ===
import { useTokenStore } from "../../store/tokenStore";
export { useTokenStore };

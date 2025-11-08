const sanitizeBaseUrl = (url: string) => url.replace(/\/+$/, "");

const getDefaultBaseUrl = () => {
  if (typeof window === "undefined") {
    return "/api/v1";
  }

  const origin = window.location.origin.replace(/\/+$/, "");
  return `${origin}/api/v1`;
};

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const API_BASE_URL = sanitizeBaseUrl(
  rawBaseUrl && rawBaseUrl.length > 0 ? rawBaseUrl : getDefaultBaseUrl()
);

export const AUTH_TOKEN_STORAGE_KEY = "financial_management_auth_token";

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const API_BASE_URL = resolveApiBaseUrl(
  configuredApiBaseUrl,
  typeof window !== "undefined" ? window.location.hostname : undefined,
);

export function resolveApiBaseUrl(apiBaseUrl: string | undefined, hostname?: string) {
  if (apiBaseUrl && !isInvalidProductionApiUrl(apiBaseUrl, hostname)) {
    return apiBaseUrl;
  }

  if (hostname === "moneyflux.cloud") {
    return "https://api.moneyflux.cloud";
  }

  return "http://localhost:3000";
}

function isInvalidProductionApiUrl(apiBaseUrl: string, hostname?: string) {
  if (hostname !== "moneyflux.cloud") {
    return false;
  }

  return apiBaseUrl.includes("localhost") || apiBaseUrl.includes("127.0.0.1");
}

type RequestOptions = {
  body?: unknown;
  headers?: HeadersInit;
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>("GET", path, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>("POST", path, { ...options, body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>("PUT", path, { ...options, body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>("PATCH", path, { ...options, body }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>("DELETE", path, options),
};

async function request<T>(method: string, path: string, options: RequestOptions = {}) {
  const token = typeof window !== "undefined" ? window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) : null;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("financial-management:unauthorized"));
    }

    throw new ApiError(
      response.status,
      data?.error?.code ?? "API_ERROR",
      data?.error?.message ?? "API request failed",
      data?.error?.details,
    );
  }

  return data as T;
}

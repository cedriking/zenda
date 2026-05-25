const API_BASE_URL = import.meta.env.VITE_API_URL ?? "https://api.zenda.bot";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

interface RequestOptions {
  body?: unknown;
  headers?: Record<string, string>;
  method?: string;
}

function getAccessToken(): string | null {
  return localStorage.getItem("accessToken");
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    return null;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  let token = getAccessToken();
  const makeRequest = (accessToken: string | null) =>
    fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

  let response = await makeRequest(token);

  // Auto-refresh on 401
  if (response.status === 401 && token) {
    token = await refreshAccessToken();
    if (token) {
      response = await makeRequest(token);
    } else {
      // Refresh failed — clear session and redirect to login
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("workspace");
      localStorage.removeItem("user");
      window.location.href = "/auth/login";
      return undefined as T;
    }
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    if (data?.details) {
      const msgs = data.details
        .map((d: { message: string }) => d.message)
        .join(". ");
      throw new ApiError(
        response.status,
        msgs || data?.error || `HTTP ${response.status}`
      );
    }
    throw new ApiError(
      response.status,
      data?.error ?? data?.message ?? `HTTP ${response.status}`
    );
  }

  return response.json();
}

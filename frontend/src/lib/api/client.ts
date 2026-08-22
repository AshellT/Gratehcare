/**
 * GratehCare API Client
 * ─────────────────────
 * - Attaches Bearer token from the Nest JWT stored in sessionStorage.
 * - Adds X-Tenant-Id header from the stored organisation id.
 * - Retries once on 401 after a token refresh.
 * - On network error / server not reachable, withFallback returns empty data
 *   with { _isMock: true } so callers can show offline state without fake rows.
 */

import { API_BASE, buildApiUrl } from "./config";
import type { PaginatedResponse } from "./types";

export { API_BASE };

const API_REQUEST_TIMEOUT_MS = 30_000;

const TOKEN_STORE_KEY = "gratehcare.api.access_token";
const REFRESH_STORE_KEY = "gratehcare.api.refresh_token";
const TENANT_STORE_KEY = "gratehcare.api.tenant_id";
const REFRESH_LOCK_KEY = "gratehcare.api.refreshing";

// ─── Token helpers ────────────────────────────────────────────────────────────

export function storeToken(token: string): void {
  try {
    sessionStorage.setItem(TOKEN_STORE_KEY, token);
  } catch {}
}

export function getStoredToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_STORE_KEY);
  } catch {
    return null;
  }
}

export function clearToken(): void {
  try {
    sessionStorage.removeItem(TOKEN_STORE_KEY);
  } catch {}
}

export function storeRefreshToken(token: string): void {
  try {
    sessionStorage.setItem(REFRESH_STORE_KEY, token);
  } catch {}
}

export function getStoredRefreshToken(): string | null {
  try {
    return sessionStorage.getItem(REFRESH_STORE_KEY);
  } catch {
    return null;
  }
}

export function clearRefreshToken(): void {
  try {
    sessionStorage.removeItem(REFRESH_STORE_KEY);
  } catch {}
}

export function storeTenantId(tenantId: string): void {
  try {
    localStorage.setItem(TENANT_STORE_KEY, tenantId);
  } catch {}
}

export function clearTenantId(): void {
  try {
    localStorage.removeItem(TENANT_STORE_KEY);
  } catch {}
}

async function getBearerToken(): Promise<string | null> {
  return getStoredToken();
}

function getTenantId(): string | null {
  try {
    return localStorage.getItem(TENANT_STORE_KEY);
  } catch {}
  return null;
}

async function refreshToken(): Promise<string | null> {
  if (sessionStorage.getItem(REFRESH_LOCK_KEY)) return null;
  const refresh = getStoredRefreshToken();
  if (!refresh) return null;
  sessionStorage.setItem(REFRESH_LOCK_KEY, "1");
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
      signal: AbortSignal.timeout(API_REQUEST_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { accessToken?: string; refreshToken?: string };
    if (!json.accessToken) return null;
    storeToken(json.accessToken);
    if (json.refreshToken) storeRefreshToken(json.refreshToken);
    return json.accessToken;
  } catch {
    return null;
  } finally {
    sessionStorage.removeItem(REFRESH_LOCK_KEY);
  }
}

// ─── Error type ───────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly upgradeUrl?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const isApiError = (e: unknown): e is ApiError => e instanceof ApiError;

export type BackendPage<T> = PaginatedResponse<T> | {
  items?: T[];
  data?: T[];
  total?: number;
  page?: number;
  limit?: number;
};

export function emptyPage<T>(limit = 20): PaginatedResponse<T> {
  return { data: [], total: 0, page: 1, limit };
}

export function normalizePage<T>(page: BackendPage<T>): PaginatedResponse<T> {
  const data = Array.isArray((page as any).data)
    ? (page as any).data
    : Array.isArray((page as any).items)
      ? (page as any).items
      : [];

  return {
    data,
    total: typeof page.total === "number" ? page.total : data.length,
    page: typeof page.page === "number" ? page.page : 1,
    limit: typeof page.limit === "number" ? page.limit : data.length || 20,
  };
}

// ─── Core request ─────────────────────────────────────────────────────────────

export interface RequestOptions extends Omit<RequestInit, "body"> {
  /** Pass a plain object or FormData; strings passed as-is. */
  body?: Record<string, unknown> | FormData | string | null;
  /** Query parameters appended to the URL */
  params?: Record<string, string | number | boolean | undefined>;
  /** When true, skip auth header (public endpoints) */
  public?: boolean;
}

async function request<T>(
  path: string,
  opts: RequestOptions = {},
  retried = false,
): Promise<T> {
  const { body, params, public: isPublic, ...fetchOpts } = opts;

  // Build URL (relative /api/v1 needs window.origin — `new URL("/api/v1/...")` throws)
  const url = buildApiUrl(path);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }

  // Build headers
  const headers: Record<string, string> = {};

  if (!isPublic) {
    const token = await getBearerToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const tenantId = getTenantId();
    if (tenantId) headers["X-Tenant-Id"] = tenantId;
  }

  // Body
  let serialisedBody: BodyInit | undefined;
  if (body instanceof FormData) {
    serialisedBody = body;
  } else if (body !== null && body !== undefined) {
    headers["Content-Type"] = "application/json";
    serialisedBody = JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      ...fetchOpts,
      headers: {
        ...headers,
        ...((fetchOpts.headers as Record<string, string>) ?? {}),
      },
      body: serialisedBody,
      signal: AbortSignal.timeout(API_REQUEST_TIMEOUT_MS),
    });
  } catch {
    // Network / CORS / server down — bubble up as a typed offline error
    throw new ApiError(0, "NETWORK_ERROR", "Backend unreachable");
  }

  // 401 → refresh once then retry
  if (res.status === 401 && !retried && !isPublic) {
    const newToken = await refreshToken();
    if (newToken) return request<T>(path, opts, true);
    throw new ApiError(401, "UNAUTHORIZED", "Session expired");
  }

  if (!res.ok) {
    let payload: any = {};
    try {
      payload = await res.json();
    } catch {}
    const nested =
      payload?.message && typeof payload.message === "object" ? payload.message : null;
    const code = nested?.code ?? payload?.code ?? payload?.error ?? "API_ERROR";
    const message =
      nested?.message ??
      (typeof payload?.message === "string" ? payload.message : undefined) ??
      `HTTP ${res.status}`;
    const upgradeUrl = nested?.upgradeUrl ?? payload?.upgradeUrl;

    if (code === "TRIAL_EXPIRED" && typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("gratehcare:trial-expired", {
          detail: { message, upgradeUrl: upgradeUrl || "/app/plans" },
        }),
      );
    }

    throw new ApiError(res.status, code, message, upgradeUrl);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const apiClient = {
  get: <T>(path: string, opts?: RequestOptions) =>
    request<T>(path, { method: "GET", ...opts }),

  post: <T>(
    path: string,
    body?: RequestOptions["body"],
    opts?: RequestOptions,
  ) => request<T>(path, { method: "POST", body, ...opts }),

  patch: <T>(
    path: string,
    body?: RequestOptions["body"],
    opts?: RequestOptions,
  ) => request<T>(path, { method: "PATCH", body, ...opts }),

  put: <T>(
    path: string,
    body?: RequestOptions["body"],
    opts?: RequestOptions,
  ) => request<T>(path, { method: "PUT", body, ...opts }),

  delete: <T>(path: string, opts?: RequestOptions) =>
    request<T>(path, { method: "DELETE", ...opts }),
};

/**
 * Wraps an API call and returns empty fallback data on network errors.
 */
export async function withFallback<T>(
  call: () => Promise<T>,
  fallback: T,
): Promise<T & { _isMock?: boolean }> {
  try {
    return await call();
  } catch (e) {
    if (e instanceof ApiError && e.status === 0) {
      return {
        ...((typeof fallback === "object" && fallback !== null
          ? fallback
          : { data: fallback }) as object),
        _isMock: true,
      } as T & { _isMock: boolean };
    }
    throw e;
  }
}

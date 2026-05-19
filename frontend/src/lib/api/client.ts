/**
 * GratehCare API Client
 * ─────────────────────
 * - Attaches Bearer token from the active Supabase session automatically.
 * - Adds X-Tenant-Id header from the stored organisation id.
 * - Retries once on 401 after a token refresh.
 * - On network error / server not reachable returns { _isMock: true } so
 *   callers can substitute fallback mock data without crashing.
 */

import { supabase } from "@/lib/supabase";

// ─── Config ──────────────────────────────────────────────────────────────────

export const API_BASE =
  (process.env.REACT_APP_API_URL ?? "http://localhost:3000") + "/api/v1";

const TOKEN_STORE_KEY = "gratehcare.api.access_token";
const TENANT_STORE_KEY = "gratehcare.api.tenant_id";
const REFRESH_LOCK_KEY = "gratehcare.api.refreshing";

// ─── Token helpers ────────────────────────────────────────────────────────────

export function storeToken(token: string): void {
  try {
    sessionStorage.setItem(TOKEN_STORE_KEY, token);
  } catch {}
}

export function clearToken(): void {
  try {
    sessionStorage.removeItem(TOKEN_STORE_KEY);
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
  try {
    // Prefer the live Supabase session token (auto-refreshed by supabase-js)
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) return data.session.access_token;
  } catch {}
  // Fallback to manually stored token
  try {
    return sessionStorage.getItem(TOKEN_STORE_KEY);
  } catch {}
  return null;
}

function getTenantId(): string | null {
  try {
    return localStorage.getItem(TENANT_STORE_KEY);
  } catch {}
  return null;
}

async function refreshToken(): Promise<string | null> {
  // Guard against parallel refresh storms
  if (sessionStorage.getItem(REFRESH_LOCK_KEY)) return null;
  sessionStorage.setItem(REFRESH_LOCK_KEY, "1");
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error || !data.session) return null;
    return data.session.access_token;
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
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const isApiError = (e: unknown): e is ApiError => e instanceof ApiError;

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

  // Build URL
  const url = new URL(`${API_BASE}${path}`);
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
    throw new ApiError(
      res.status,
      payload?.error ?? payload?.message ?? "API_ERROR",
      payload?.message ?? `HTTP ${res.status}`,
    );
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
 * Wraps an API call and returns mock data on network errors.
 * Use this in every service function for graceful offline behaviour.
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

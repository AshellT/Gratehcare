import {
  apiClient,
  clearToken,
  clearTenantId,
  storeTenantId,
  storeToken,
  withFallback,
} from "./client";
import type { User } from "./types";

export interface LoginPayload {
  email: string;
  password: string;
}
export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
  tenantId?: string;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<AuthResponse>("/auth/login", payload as any, { public: true }),

  logout: () =>
    withFallback(() => apiClient.post("/auth/logout", {}), undefined),

  refreshToken: (token: string) =>
    apiClient.post<{ accessToken: string }>("/auth/refresh", {
      refreshToken: token,
    } as any),

  me: () =>
    withFallback(
      () => apiClient.get<User>("/auth/me"),
      null as unknown as User,
    ),

  completeOAuth: (body: { organizationName?: string }, accessToken: string) =>
    apiClient.post<AuthResponse>("/auth/oauth/complete", body as any, {
      public: true,
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  /** Convenience: persist tokens after a successful login response */
  persistSession: (resp: AuthResponse) => {
    storeToken(resp.accessToken);
    const tenantId = resp.tenantId || (resp.user as any)?.tenantId;
    if (tenantId) storeTenantId(tenantId);
  },

  clearSession: () => {
    clearToken();
    clearTenantId();
  },
};

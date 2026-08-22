import {
  apiClient,
  clearRefreshToken,
  clearToken,
  clearTenantId,
  getStoredToken,
  storeRefreshToken,
  storeTenantId,
  storeToken,
} from "./client";
import type { User } from "./types";

export interface LoginPayload {
  email: string;
  password: string;
}
export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  role: string;
  organizationName?: string;
  planId?: string;
}
export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
  tenantId?: string;
}
export type RegisterResponse =
  | AuthResponse
  | { message: string; userId: string };

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<AuthResponse>("/auth/login", payload as any, { public: true }),

  register: (payload: RegisterPayload) =>
    apiClient.post<RegisterResponse>("/auth/register", payload as any, { public: true }),

  logout: async () => {
    try {
      await apiClient.post("/auth/logout", {});
    } catch {
      // ignore — client always clears the session
    }
  },

  refreshToken: (token: string) =>
    apiClient.post<AuthResponse>("/auth/refresh", {
      refreshToken: token,
    } as any, { public: true }),

  me: async (): Promise<User | null> => {
    if (!getStoredToken()) return null;
    try {
      return await apiClient.get<User>("/auth/me");
    } catch {
      return null;
    }
  },

  forgotPassword: (email: string) =>
    apiClient.post<{ ok: boolean }>("/auth/forgot-password", { email } as any, {
      public: true,
    }),

  resetPassword: (token: string, password: string) =>
    apiClient.post<{ ok: boolean }>("/auth/reset-password", { token, password } as any, {
      public: true,
    }),

  persistSession: (resp: AuthResponse) => {
    storeToken(resp.accessToken);
    if (resp.refreshToken) storeRefreshToken(resp.refreshToken);
    const tenantId = resp.tenantId || (resp.user as any)?.tenantId;
    if (tenantId) storeTenantId(tenantId);
  },

  clearSession: () => {
    clearToken();
    clearRefreshToken();
    clearTenantId();
  },
};

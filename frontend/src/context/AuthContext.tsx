import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { authApi } from "@/lib/api/auth";
import { supabase, type Profile } from "@/lib/supabase";
import type { Role } from "@/lib/roles";
import { roleToPrisma } from "@/lib/roles";
import type { PlanId } from "@/lib/plans";
import { persistSignupPlan } from "@/lib/signupPlan";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  organization: string;
  organization_id: string | null;
  avatarColor: string;
  avatarUrl?: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  updateProfile: (patch: Partial<Pick<AuthUser, "name" | "avatarColor" | "avatarUrl">>) => void;
  login: (data: { email: string; password: string }) => Promise<AuthUser>;
  loginWithOAuth: (
    provider: "google",
    options?: { organization?: string; planId?: PlanId },
  ) => Promise<void>;
  completeOAuthCallback: () => Promise<AuthUser>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: Role;
    organization: string;
    planId?: PlanId;
  }) => Promise<AuthUser | null>;
  logout: () => Promise<void>;
  switchRole: (role: Role) => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY as string;

const accentForRole: Record<Role, string> = {
  platform_owner: "#7c3aed",
  super_admin: "#0f172a",
  platform_support: "#f97316",
  org_owner: "#4f46e5",
  operations_admin: "#0ea5e9",
  care_coordinator: "#6366f1",
  support_worker: "#e11d48",
  billing_officer: "#10b981",
  compliance_officer: "#d97706",
  family: "#d946ef",
  practitioner: "#14b8a6",
};

const PREVIEW_ROLE_KEY = "gratehcare.preview.role";
const DEMO_USER_KEY = "gratehcare.demo.user";
const OAUTH_PENDING_KEY = "gratehcare.oauth.pending";

function clearPreviewRole() {
  try {
    localStorage.removeItem(PREVIEW_ROLE_KEY);
  } catch {
    // ignore
  }
}

const demoUsers: Record<string, Omit<AuthUser, "id" | "email">> = {
  "platform.owner@gratehcare.test": {
    name: "Platform Owner",
    role: "platform_owner",
    organization: "GRATEHCARE Demo Organization",
    organization_id: null,
    avatarColor: "#7c3aed",
  },
  "super.admin@gratehcare.test": {
    name: "Super Admin",
    role: "super_admin",
    organization: "GRATEHCARE Demo Organization",
    organization_id: null,
    avatarColor: "#0f172a",
  },
  "platform.support@gratehcare.test": {
    name: "Platform Support",
    role: "platform_support",
    organization: "GRATEHCARE Demo Organization",
    organization_id: null,
    avatarColor: "#f97316",
  },
  "org.owner@gratehcare.test": {
    name: "Organization Owner",
    role: "org_owner",
    organization: "GRATEHCARE Demo Organization",
    organization_id: null,
    avatarColor: "#4f46e5",
  },
  "operations.admin@gratehcare.test": {
    name: "Operations Admin",
    role: "operations_admin",
    organization: "GRATEHCARE Demo Organization",
    organization_id: null,
    avatarColor: "#0ea5e9",
  },
  "care.coordinator@gratehcare.test": {
    name: "Care Coordinator",
    role: "care_coordinator",
    organization: "GRATEHCARE Demo Organization",
    organization_id: null,
    avatarColor: "#6366f1",
  },
  "support.worker@gratehcare.test": {
    name: "Support Worker",
    role: "support_worker",
    organization: "GRATEHCARE Demo Organization",
    organization_id: null,
    avatarColor: "#e11d48",
  },
  "billing.officer@gratehcare.test": {
    name: "Billing Officer",
    role: "billing_officer",
    organization: "GRATEHCARE Demo Organization",
    organization_id: null,
    avatarColor: "#10b981",
  },
  "compliance.officer@gratehcare.test": {
    name: "Compliance Officer",
    role: "compliance_officer",
    organization: "GRATEHCARE Demo Organization",
    organization_id: null,
    avatarColor: "#d97706",
  },
  "family@gratehcare.test": {
    name: "Family Member",
    role: "family",
    organization: "GRATEHCARE Demo Organization",
    organization_id: null,
    avatarColor: "#d946ef",
  },
  "practitioner@gratehcare.test": {
    name: "Practitioner",
    role: "practitioner",
    organization: "GRATEHCARE Demo Organization",
    organization_id: null,
    avatarColor: "#14b8a6",
  },
};

const prismaRoleToUiRole: Record<string, Role> = {
  PLATFORM_OWNER: "platform_owner",
  SUPER_ADMIN: "super_admin",
  PLATFORM_SUPPORT: "platform_support",
  ORGANIZATION_OWNER: "org_owner",
  OPERATIONS_ADMIN: "operations_admin",
  CARE_COORDINATOR: "care_coordinator",
  SUPPORT_WORKER: "support_worker",
  BILLING_OFFICER: "billing_officer",
  COMPLIANCE_OFFICER: "compliance_officer",
  FAMILY_USER: "family",
  PRACTITIONER: "practitioner",
};

const getDemoUser = (email: string, password: string): AuthUser | null => {
  const normalizedEmail = email.trim().toLowerCase();
  const demo = demoUsers[normalizedEmail];
  if (!demo || password !== "0778007350") return null;

  return {
    id: `demo-${demo.role}`,
    email: normalizedEmail,
    ...demo,
  };
};

const profileToAuthUser = (profile: Profile): AuthUser => {
  const role = profile.role as Role;
  return {
    id: profile.id,
    name: profile.full_name || profile.email,
    email: profile.email,
    role,
    organization: profile.organization_name || "—",
    organization_id: profile.organization_id,
    avatarColor: profile.avatar_color || accentForRole[role],
  };
};

const userFromBackendSession = (
  backendUser: any,
  email: string,
  fallbackOrg?: string,
): AuthUser => {
  const role = prismaRoleToUiRole[backendUser.roles?.[0]] || "org_owner";
  return {
    id: backendUser.sub || backendUser.id,
    email: backendUser.email || email,
    name:
      backendUser.fullName ||
      backendUser.email?.split("@")[0] ||
      email.split("@")[0],
    role,
    organization: fallbackOrg || "My Organization",
    organization_id: backendUser.tenantId || null,
    avatarColor: backendUser.avatarColor || accentForRole[role],
    avatarUrl: backendUser.avatarUrl ?? null,
  };
};

const authErrorMessage = (data: any, fallback: string) => {
  const code = data?.error_code || data?.code;
  const message = data?.msg || data?.error_description || data?.error;

  if (code === "invalid_credentials") {
    return "Invalid email or password. Create an account first, or check that the email has been confirmed.";
  }

  if (code === "email_not_confirmed") {
    return "Please confirm your email address before signing in.";
  }

  if (code === "signup_disabled") {
    return "Sign ups are currently disabled for this Supabase project.";
  }

  if (code === "weak_password") {
    return message || "Please choose a stronger password.";
  }

  return message || fallback;
};

/**
 * Direct REST calls to Supabase via XMLHttpRequest to fully bypass any
 * fetch interceptors that cause body-stream-already-read errors in the
 * dev environment. We still use the supabase client for session
 * persistence and onAuthStateChange subscriptions.
 */
const xhrJson = (url: string, body: any): Promise<{ ok: boolean; status: number; data: any }> =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("apikey", SUPABASE_ANON_KEY);
    xhr.setRequestHeader("Authorization", `Bearer ${SUPABASE_ANON_KEY}`);
    xhr.onload = () => {
      let parsed: any = null;
      try {
        parsed = xhr.responseText ? JSON.parse(xhr.responseText) : null;
      } catch {
        parsed = { error: xhr.responseText };
      }
      resolve({ ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status, data: parsed });
    };
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(JSON.stringify(body));
  });

const authRest = {
  signUp: async (email: string, password: string, data: Record<string, any>) => {
    const r = await xhrJson(`${SUPABASE_URL}/auth/v1/signup`, { email, password, data });
    if (!r.ok) {
      throw new Error(authErrorMessage(r.data, "Sign up failed"));
    }
    return r.data;
  },
  signIn: async (email: string, password: string) => {
    const r = await xhrJson(
      `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
      { email, password },
    );
    if (!r.ok) {
      throw new Error(authErrorMessage(r.data, "Invalid credentials"));
    }
    return r.data as {
      access_token: string;
      refresh_token: string;
      user: { id: string; email: string; user_metadata?: Record<string, any> };
    };
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(
    async (
      userId: string,
      fallback?: { email?: string; meta?: Record<string, any> },
    ): Promise<AuthUser | null> => {
      try {
        const { data, error: profileError } = await supabase
          .from("profiles_with_org")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (data) {
          return profileToAuthUser(data as Profile);
        }

        if (profileError) {
          console.warn("[Auth] profile fetch error", profileError.message);
        }

        const meta = fallback?.meta || {};
        const role = ((meta.role as Role) || "org_owner") as Role;
        return {
          id: userId,
          name:
            (meta.full_name as string) ||
            (fallback?.email ? fallback.email.split("@")[0] : "GRATEHCARE User"),
          email: fallback?.email || "",
          role,
          organization: (meta.organization_name as string) || "My Organization",
          organization_id: null,
          avatarColor: accentForRole[role],
        };
      } catch (e) {
        console.error("[Auth] loadProfile failed", e);
        return null;
      }
    },
    [],
  );

  // Hydrate from existing session and listen for changes
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        clearPreviewRole();
        const storedDemoUser = localStorage.getItem(DEMO_USER_KEY);
        if (storedDemoUser) {
          setUser(JSON.parse(storedDemoUser) as AuthUser);
          return;
        }

        const { data } = await supabase.auth.getSession();
        const session = data.session;
        if (mounted && session?.user) {
          const u = await loadProfile(session.user.id, {
            email: session.user.email,
            meta: session.user.user_metadata || {},
          });
          setUser(u);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;
        if (session?.user) {
          const u = await loadProfile(session.user.id, {
            email: session.user.email,
            meta: session.user.user_metadata || {},
          });
          setUser(u);
        } else {
          setUser(null);
        }
      },
    );

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login: AuthContextValue["login"] = async ({ email, password }) => {
    setError(null);
    clearPreviewRole();
    try {
      const backendSession = await authApi.login({ email, password });
      authApi.persistSession(backendSession);

      const backendUser = backendSession.user as any;
      const demoUser = getDemoUser(email, password);
      const u: AuthUser = {
        ...userFromBackendSession(backendUser, email, demoUser?.organization),
        organization: demoUser?.organization || "GRATEHCARE Demo Organization",
      };
      if (u) setUser(u);
      return u;
    } catch (e: any) {
      const msg = e?.message || "Could not sign in.";
      setError(msg);
      throw new Error(msg);
    }
  };

  const loginWithOAuth: AuthContextValue["loginWithOAuth"] = async (
    provider,
    options,
  ) => {
    setError(null);
    clearPreviewRole();
    try {
      if (options?.organization || options?.planId) {
        sessionStorage.setItem(
          OAUTH_PENDING_KEY,
          JSON.stringify({
            organization: options.organization,
            planId: options.planId,
          }),
        );
      } else {
        sessionStorage.removeItem(OAUTH_PENDING_KEY);
      }

      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          queryParams: { prompt: "select_account" },
        },
      });
      if (oauthError) throw new Error(oauthError.message);
    } catch (e: any) {
      const msg = e?.message || "Could not start social sign-in.";
      setError(msg);
      throw new Error(msg);
    }
  };

  const completeOAuthCallback: AuthContextValue["completeOAuthCallback"] =
    async () => {
      setError(null);
      clearPreviewRole();

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error("No active session after social sign-in.");
      }

      let organizationName: string | undefined;
      let planId: PlanId | undefined;
      try {
        const raw = sessionStorage.getItem(OAUTH_PENDING_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          organizationName = parsed.organization;
          planId = parsed.planId;
        }
        sessionStorage.removeItem(OAUTH_PENDING_KEY);
      } catch {
        sessionStorage.removeItem(OAUTH_PENDING_KEY);
      }

      const backendSession = await authApi.completeOAuth(
        { organizationName, planId },
        session.access_token,
      );

      authApi.persistSession({
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        user: backendSession.user,
        tenantId: backendSession.tenantId,
      });

      const email = backendSession.user?.email || session.user.email || "";
      const u = userFromBackendSession(
        backendSession.user,
        email,
        organizationName ||
          (session.user.user_metadata?.organization_name as string | undefined),
      );
      if (planId) persistSignupPlan(planId);
      setUser(u);
      return u;
    };

  const register: AuthContextValue["register"] = async ({
    name,
    email,
    password,
    role,
    organization,
    planId,
  }) => {
    setError(null);
    try {
      const response = await authApi.register({
        email,
        password,
        fullName: name,
        role: roleToPrisma(role),
        organizationName: organization,
        planId,
      });

      if ("accessToken" in response && response.accessToken) {
        if (response.refreshToken) {
          await supabase.auth.setSession({
            access_token: response.accessToken,
            refresh_token: response.refreshToken,
          });
        }
        authApi.persistSession(response);
        const u: AuthUser = {
          ...userFromBackendSession(response.user, email, organization),
          organization,
        };
        if (planId) persistSignupPlan(planId);
        setUser(u);
        return u;
      }

      if (planId) persistSignupPlan(planId);
      return null;
    } catch (e: any) {
      const msg = e?.message || "Sign up failed.";
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    authApi.clearSession();
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    try {
      localStorage.removeItem(PREVIEW_ROLE_KEY);
      localStorage.removeItem(DEMO_USER_KEY);
    } catch {
      // ignore
    }
    setUser(null);
  };

  const switchRole = (_role: Role) => {
    // Role preview removed — navigation always reflects the signed-in account.
  };

  const refreshProfile = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      const u = await loadProfile(data.user.id, {
        email: data.user.email,
        meta: data.user.user_metadata || {},
      });
      if (u) setUser(u);
    }
  };

  const updateProfile = useCallback(
    (patch: Partial<Pick<AuthUser, "name" | "avatarColor" | "avatarUrl">>) => {
      setUser((prev) => (prev ? { ...prev, ...patch } : prev));
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      error,
      updateProfile,
      login,
      loginWithOAuth,
      completeOAuthCallback,
      register,
      logout,
      switchRole,
      refreshProfile,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, loading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

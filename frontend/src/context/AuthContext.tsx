import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { supabase, type Profile } from "@/lib/supabase";
import type { Role } from "@/lib/roles";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  organization: string;
  organization_id: string | null;
  avatarColor: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (data: { email: string; password: string }) => Promise<AuthUser>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: Role;
    organization: string;
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

const PREVIEW_ROLE_KEY = "lumina.preview.role";

const profileToAuthUser = (
  profile: Profile,
  previewRole: Role | null,
): AuthUser => {
  const role = (previewRole as Role) || (profile.role as Role);
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
      throw new Error(
        r.data?.msg || r.data?.error_description || r.data?.error || "Sign up failed",
      );
    }
    return r.data;
  },
  signIn: async (email: string, password: string) => {
    const r = await xhrJson(
      `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
      { email, password },
    );
    if (!r.ok) {
      throw new Error(
        r.data?.msg || r.data?.error_description || r.data?.error || "Invalid credentials",
      );
    }
    return r.data as {
      access_token: string;
      refresh_token: string;
      user: { id: string; email: string };
    };
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewRole, setPreviewRole] = useState<Role | null>(() => {
    try {
      return (localStorage.getItem(PREVIEW_ROLE_KEY) as Role) || null;
    } catch {
      return null;
    }
  });

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
          return profileToAuthUser(data as Profile, previewRole);
        }

        if (profileError) {
          console.warn("[Auth] profile fetch error", profileError.message);
        }

        // Profile row not yet visible (trigger lag, or schema not run) — fallback
        const meta = fallback?.meta || {};
        const role = ((meta.role as Role) || "org_owner") as Role;
        return {
          id: userId,
          name:
            (meta.full_name as string) ||
            (fallback?.email ? fallback.email.split("@")[0] : "Lumina User"),
          email: fallback?.email || "",
          role: previewRole || role,
          organization: (meta.organization_name as string) || "My Organization",
          organization_id: null,
          avatarColor: accentForRole[previewRole || role],
        };
      } catch (e) {
        console.error("[Auth] loadProfile failed", e);
        return null;
      }
    },
    [previewRole],
  );

  // Hydrate from existing session and listen for changes
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
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

  // Reapply preview role override on user
  useEffect(() => {
    setUser((prev) => {
      if (!prev) return prev;
      const role = previewRole || prev.role;
      return { ...prev, role, avatarColor: accentForRole[role] };
    });
  }, [previewRole]);

  const login: AuthContextValue["login"] = async ({ email, password }) => {
    setError(null);
    try {
      const result = await authRest.signIn(email, password);
      // Hand the session to supabase-js so it persists & refreshes it
      await supabase.auth.setSession({
        access_token: result.access_token,
        refresh_token: result.refresh_token,
      });
      const u = await loadProfile(result.user.id, { email: result.user.email });
      if (u) setUser(u);
      return u as AuthUser;
    } catch (e: any) {
      const msg = e?.message || "Could not sign in.";
      setError(msg);
      throw new Error(msg);
    }
  };

  const register: AuthContextValue["register"] = async ({
    name,
    email,
    password,
    role,
    organization,
  }) => {
    setError(null);
    try {
      const meta = {
        full_name: name,
        role,
        organization_name: organization,
        avatar_color: accentForRole[role],
      };
      const result = await authRest.signUp(email, password, meta);

      // If the project has email confirmation off, signup returns access_token
      if (result.access_token && result.refresh_token) {
        await supabase.auth.setSession({
          access_token: result.access_token,
          refresh_token: result.refresh_token,
        });
        const u = await loadProfile(result.user.id, {
          email: result.user.email,
          meta,
        });
        if (u) setUser(u);
        return u;
      }
      // Email confirmation required
      return null;
    } catch (e: any) {
      const msg = e?.message || "Sign up failed.";
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    try {
      localStorage.removeItem(PREVIEW_ROLE_KEY);
    } catch {
      // ignore
    }
    setPreviewRole(null);
    setUser(null);
  };

  const switchRole = (role: Role) => {
    setPreviewRole(role);
    try {
      localStorage.setItem(PREVIEW_ROLE_KEY, role);
    } catch {
      // ignore
    }
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

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, error, login, register, logout, switchRole, refreshProfile }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, loading, error, previewRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

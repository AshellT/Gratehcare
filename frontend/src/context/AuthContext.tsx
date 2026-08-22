import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { authApi } from "@/lib/api/auth";
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

const demoOrgNames: Record<string, string> = {
  "platform.owner@gratehcare.test": "GRATEHCARE Demo Organization",
  "super.admin@gratehcare.test": "GRATEHCARE Demo Organization",
  "platform.support@gratehcare.test": "GRATEHCARE Demo Organization",
  "org.owner@gratehcare.test": "GRATEHCARE Demo Organization",
  "operations.admin@gratehcare.test": "GRATEHCARE Demo Organization",
  "care.coordinator@gratehcare.test": "GRATEHCARE Demo Organization",
  "support.worker@gratehcare.test": "GRATEHCARE Demo Organization",
  "billing.officer@gratehcare.test": "GRATEHCARE Demo Organization",
  "compliance.officer@gratehcare.test": "GRATEHCARE Demo Organization",
  "family@gratehcare.test": "GRATEHCARE Demo Organization",
  "practitioner@gratehcare.test": "GRATEHCARE Demo Organization",
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

const userFromBackendSession = (
  backendUser: any,
  email: string,
  fallbackOrg?: string,
): AuthUser => {
  const role = prismaRoleToUiRole[backendUser.roles?.[0]] || "org_owner";
  const resolvedEmail = (backendUser.email || email).toLowerCase();
  return {
    id: backendUser.sub || backendUser.id,
    email: resolvedEmail,
    name:
      backendUser.fullName ||
      backendUser.email?.split("@")[0] ||
      email.split("@")[0],
    role,
    organization:
      backendUser.organization ||
      fallbackOrg ||
      demoOrgNames[resolvedEmail] ||
      "My Organization",
    organization_id: backendUser.tenantId || null,
    avatarColor: backendUser.avatarColor || accentForRole[role],
    avatarUrl: backendUser.avatarUrl ?? null,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    try {
      const me = await authApi.me();
      if (!me) {
        authApi.clearSession();
        setUser(null);
        return;
      }
      setUser(userFromBackendSession(me, (me as any).email || ""));
    } catch {
      authApi.clearSession();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        try {
          localStorage.removeItem(PREVIEW_ROLE_KEY);
        } catch {
          // ignore
        }
        const storedDemoUser = localStorage.getItem(DEMO_USER_KEY);
        if (storedDemoUser) {
          if (mounted) setUser(JSON.parse(storedDemoUser) as AuthUser);
          return;
        }
        await refreshProfile();
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [refreshProfile]);

  const login: AuthContextValue["login"] = async ({ email, password }) => {
    setError(null);
    try {
      const backendSession = await authApi.login({ email, password });
      authApi.persistSession(backendSession);
      const u = userFromBackendSession(backendSession.user, email);
      setUser(u);
      return u;
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
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    authApi.clearSession();
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
      register,
      logout,
      switchRole,
      refreshProfile,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, loading, error, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

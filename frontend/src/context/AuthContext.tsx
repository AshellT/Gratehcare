import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Role } from "@/lib/roles";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  organization: string;
  avatarColor: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (data: {
    email: string;
    password?: string;
    role?: Role;
    name?: string;
    organization?: string;
  }) => Promise<AuthUser>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: Role;
    organization: string;
  }) => Promise<AuthUser>;
  logout: () => void;
  switchRole: (role: Role) => void;
};

const STORAGE_KEY = "lumina.auth.user";

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const persist = (u: AuthUser | null) => {
    setUser(u);
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const login: AuthContextValue["login"] = async ({
    email,
    role = "org_owner",
    name,
    organization,
  }) => {
    const derivedName =
      name ||
      email
        .split("@")[0]
        .replace(/[._-]/g, " ")
        .replace(/\b\w/g, (m) => m.toUpperCase()) ||
      "Lumina User";
    const u: AuthUser = {
      id: `u_${Math.random().toString(36).slice(2, 10)}`,
      name: derivedName,
      email,
      role,
      organization: organization || "Meridian Home Care",
      avatarColor: accentForRole[role],
    };
    persist(u);
    return u;
  };

  const register: AuthContextValue["register"] = async ({
    name,
    email,
    role,
    organization,
  }) => {
    const u: AuthUser = {
      id: `u_${Math.random().toString(36).slice(2, 10)}`,
      name,
      email,
      role,
      organization,
      avatarColor: accentForRole[role],
    };
    persist(u);
    return u;
  };

  const logout = () => persist(null);

  const switchRole = (role: Role) => {
    if (!user) return;
    persist({ ...user, role, avatarColor: accentForRole[role] });
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, register, logout, switchRole }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

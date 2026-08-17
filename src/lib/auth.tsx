import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { login as apiLogin } from "@/services/auth.service";

export type Role =
  | "SUPER_ADMIN"
  | "HOSPITAL_ADMIN"
  | "ADMIN"
  | "ADMINISTRATOR"
  | "DOCTOR"
  | "ASSISTANT"
  | "NURSE"
  | "RECEPTIONIST"
  | "PHARMACIST"
  | "LAB_TECHNICIAN"
  | string;

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  title?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (loginId: string, password: string) => Promise<AuthUser>;
  logout: () => void;
};

const STORAGE_KEY = "jeevix.auth.user";
const TOKEN_KEY = "jeevix.auth.token";
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setUser(JSON.parse(raw) as AuthUser);
      }
    } catch (error) {
      console.error("Failed to restore auth session:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (loginId: string, password: string) => {
    const { staff, token } = await apiLogin({ loginId, password });

    const nextUser: AuthUser = {
      id: staff._id,
      name: staff.displayName || `${staff.firstName ?? ""} ${staff.lastName ?? ""}`.trim(),
      email: staff.email,
      role: (staff.role ?? "USER") as Role,
      title: staff.role ?? "USER",
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    localStorage.setItem(TOKEN_KEY, token);
    setUser(nextUser);

    return nextUser;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login,
      logout,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

export function roleHome(role: string | undefined) {
  const normalized = String(role ?? "")
    .trim()
    .toUpperCase()
    .replace(/-/g, "_");

  switch (normalized) {
    case "SUPER_ADMIN":
    case "HOSPITAL_ADMIN":
    case "ADMIN":
    case "ADMINISTRATOR":
      return "/admin";
    case "DOCTOR":
      return "/doctor";
    case "ASSISTANT":
      return "/assistant";
    case "NURSE":
      return "/nurse";
    case "RECEPTIONIST":
      return "/receptionist";
    case "PHARMACIST":
      return "/pharmacy";
    case "LAB_TECHNICIAN":
      return "/lab";
    default:
      return "/auth";
  }
}

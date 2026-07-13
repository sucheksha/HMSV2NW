import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role = "administrator" | "doctor" | "nurse";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  title: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, role: Role) => Promise<AuthUser>;
  logout: () => void;
}

const STORAGE_KEY = "jeevix.auth.user";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const DEMO_PROFILES: Record<Role, Omit<AuthUser, "email">> = {
  administrator: {
    id: "usr-admin-01",
    name: "Dr. Ananya Rao",
    role: "administrator",
    title: "Hospital Administrator",
  },
  doctor: {
    id: "usr-doc-14",
    name: "Dr. Vikram Shah",
    role: "doctor",
    title: "Sr. Consultant — Internal Medicine",
  },
  nurse: {
    id: "usr-nur-07",
    name: "Priya Menon",
    role: "nurse",
    title: "Staff Nurse — OPD",
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) setUser(JSON.parse(raw) as AuthUser);
    } catch {
      // ignore corrupt storage
    }
    setLoading(false);
  }, []);

  const login: AuthContextValue["login"] = async (email, _password, role) => {
    await new Promise((r) => setTimeout(r, 650)); // simulate network
    const profile = DEMO_PROFILES[role];
    const next: AuthUser = { ...profile, email };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setUser(next);
    return next;
  };

  const logout = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export function roleHome(role: Role): string {
  if (role === "administrator") return "/admin";
  if (role === "doctor") return "/doctor";
  return "/nurse";
}

import { login as loginApi, logout as logoutApi } from "@/services/auth.service";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Role =
  "SUPER_ADMIN" | "HOSPITAL_ADMIN" | "DOCTOR" | "ASSISTANT" | "NURSE" | "RECEPTIONIST";

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
  login: (loginId: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const STORAGE_KEY = "jeevix.auth.user";
const TOKEN_KEY = "jeevix.auth.token";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const token = localStorage.getItem(TOKEN_KEY);

      console.log("LocalStorage User:", raw);

      const isTokenValid = (t: string | null) => {
        if (!t) return false;
        try {
          const parts = t.split(".");
          if (parts.length < 2) return false;
          const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
          if (!payload.exp) return true; // no exp claim -> assume valid
          const now = Math.floor(Date.now() / 1000);
          return payload.exp > now;
        } catch (e) {
          return false;
        }
      };

      if (raw && token && isTokenValid(token)) {
        setUser(JSON.parse(raw));
      } else {
        // Clear any invalid or stale auth data
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      }
    } catch (error) {
      console.error(error);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }

    setLoading(false);
  }, []);

  const login: AuthContextValue["login"] = async (loginId, password) => {
    const response = await loginApi({
      loginId,
      password,
    });

    const { staff, token } = response;

    const next: AuthUser = {
      id: staff._id,
      name: staff.displayName,
      email: staff.email,
      role: staff.role,
      title: "",
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    localStorage.setItem(TOKEN_KEY, token);

    setUser(next);

    return next;
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);

      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

export function roleHome(role: Role) {
  switch (role) {
    case "SUPER_ADMIN":
      return "/admin";

    case "HOSPITAL_ADMIN":
      return "/admin";

    case "DOCTOR":
      return "/doctor";

    case "ASSISTANT":
      return "/assistant";

    case "NURSE":
      return "/nurse";

    case "RECEPTIONIST":
      return "/receptionist";

    default:
      return "/auth";
  }
}

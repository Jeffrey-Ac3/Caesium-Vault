"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type UserRole = "student" | "teacher";

export interface UserAccount {
  id?: number;
  username: string;
  role: UserRole;
}

interface AuthContextType {
  user: UserAccount | null;
  loading: boolean;
  login: (username: string, role?: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempt instant retrieval from localStorage
    try {
      const stored = localStorage.getItem("caesium_user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // Ignore storage errors
    } finally {
      setLoading(false);
    }

    // Failsafe timeout: never allow app to hang in loading state longer than 400ms
    const timer = setTimeout(() => {
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  const login = (username: string, role: UserRole = "student") => {
    const acc: UserAccount = { username, role };
    setUser(acc);
    try {
      localStorage.setItem("caesium_user", JSON.stringify(acc));
    } catch {
      // Ignore
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("caesium_user");
    } catch {
      // Ignore
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

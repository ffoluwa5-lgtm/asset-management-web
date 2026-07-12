"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import { jwtDecode } from "jwt-decode";

interface User {
  sub: number;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        setUser(jwtDecode(token));
      } catch {
        localStorage.removeItem("token");
      }
    }
  }, []);

  function login(token: string) {
    localStorage.setItem("token", token);
    setUser(jwtDecode(token));
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import backend from "~backend/client";
import type { User } from "~backend/auth/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("auth_token");
    if (savedToken) {
      setToken(savedToken);
      loadUserProfile(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadUserProfile = async (authToken: string) => {
    try {
      const authBackend = backend.with({ auth: () => ({ authorization: `Bearer ${authToken}` }) });
      const response = await authBackend.auth.getProfile();
      setUser(response.user);
    } catch (error) {
      console.error("Failed to load user profile:", error);
      localStorage.removeItem("auth_token");
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await backend.auth.login({ email, password });
    setUser(response.user);
    setToken(response.token);
    localStorage.setItem("auth_token", response.token);
  };

  const register = async (data: RegisterData) => {
    const response = await backend.auth.register(data);
    setUser(response.user);
    setToken(response.token);
    localStorage.setItem("auth_token", response.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useAuthenticatedBackend() {
  const { token } = useAuth();
  if (!token) {
    throw new Error("No authentication token available");
  }
  return backend.with({ auth: () => ({ authorization: `Bearer ${token}` }) });
}

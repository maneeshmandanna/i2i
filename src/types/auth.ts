import { DefaultSession } from "next-auth";

// Extend the default session type
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      isWhitelisted: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    isWhitelisted: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    isWhitelisted: boolean;
  }
}

// Login form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface AuthError {
  type: "CredentialsSignin" | "Configuration" | "AccessDenied" | "Verification";
  message: string;
}

// Authentication state types
export interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    isWhitelisted: boolean;
  } | null;
  isLoading: boolean;
  error: string | null;
}

// Auth store actions
export interface AuthActions {
  login: (credentials: LoginFormData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

import { create } from "zustand";
import { signIn, signOut, getSession } from "next-auth/react";
import type { AuthState, AuthActions, LoginFormData } from "@/types/auth";

interface AuthStore extends AuthState, AuthActions {}

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  isAuthenticated: false,
  user: null,
  isLoading: true,
  error: null,

  // Actions
  login: async (credentials: LoginFormData) => {
    try {
      set({ isLoading: true, error: null });

      const result = await signIn("credentials", {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      });

      if (result?.error) {
        let errorMessage = "Login failed";

        switch (result.error) {
          case "CredentialsSignin":
            errorMessage = "Invalid email or password";
            break;
          case "AccessDenied":
            errorMessage = "Access denied. User not whitelisted.";
            break;
          default:
            errorMessage = "An error occurred during login";
        }

        set({ error: errorMessage, isLoading: false });
        return;
      }

      // Get updated session
      const session = await getSession();
      if (session?.user) {
        set({
          isAuthenticated: true,
          user: session.user,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      set({
        error: "An unexpected error occurred",
        isLoading: false,
      });
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      await signOut({ redirect: false });
      set({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Logout error:", error);
      set({ isLoading: false });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));

// Helper hook to initialize auth state from session
export const useInitializeAuth = () => {
  const { isAuthenticated, user, setLoading } = useAuthStore();

  const initializeFromSession = async () => {
    try {
      setLoading(true);
      const session = await getSession();

      if (session?.user) {
        useAuthStore.setState({
          isAuthenticated: true,
          user: session.user,
          isLoading: false,
        });
      } else {
        useAuthStore.setState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("Session initialization error:", error);
      useAuthStore.setState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
    }
  };

  return { initializeFromSession, isAuthenticated, user };
};

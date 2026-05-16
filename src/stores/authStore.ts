import { create } from "zustand";
import { apiClient, AUTH_TOKEN_STORAGE_KEY } from "@/lib/api/client";

type AuthUser = {
  id: string;
  email: string;
};

type AuthResponse = {
  token: string;
  user: AuthUser;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (input: { email: string; password: string }) => Promise<void>;
  register: (input: { email: string; password: string; displayName?: string }) => Promise<void>;
  logout: () => void;
  loadSession: () => Promise<void>;
};

function readStoredToken() {
  return typeof window === "undefined" ? null : window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

function storeToken(token: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: readStoredToken(),
  user: null,
  isAuthenticated: Boolean(readStoredToken()),
  isAuthLoading: false,
  login: async (input) => {
    set({ isAuthLoading: true });
    try {
      const result = await apiClient.post<AuthResponse>("/v1/auth/login", input);
      storeToken(result.token);
      set({ token: result.token, user: result.user, isAuthenticated: true, isAuthLoading: false });
    } catch (error) {
      set({ isAuthLoading: false });
      throw error;
    }
  },
  register: async (input) => {
    set({ isAuthLoading: true });
    try {
      const result = await apiClient.post<AuthResponse>("/v1/auth/register", input);
      storeToken(result.token);
      set({ token: result.token, user: result.user, isAuthenticated: true, isAuthLoading: false });
    } catch (error) {
      set({ isAuthLoading: false });
      throw error;
    }
  },
  logout: () => {
    storeToken(null);
    set({ token: null, user: null, isAuthenticated: false, isAuthLoading: false });
  },
  loadSession: async () => {
    const token = get().token ?? readStoredToken();
    if (!token) {
      set({ token: null, user: null, isAuthenticated: false, isAuthLoading: false });
      return;
    }

    set({ token, isAuthLoading: true });
    try {
      const result = await apiClient.get<{ user: AuthUser }>("/v1/auth/me");
      set({ token, user: result.user, isAuthenticated: true, isAuthLoading: false });
    } catch {
      storeToken(null);
      set({ token: null, user: null, isAuthenticated: false, isAuthLoading: false });
    }
  },
}));

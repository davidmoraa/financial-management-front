import { create } from "zustand";
import { apiClient, AUTH_TOKEN_STORAGE_KEY } from "@/lib/api/client";
import {
  getLinkedAccounts,
  linkApple as linkAppleAccount,
  linkGoogle as linkGoogleAccount,
  linkSupabaseGoogle as linkSupabaseGoogleAccount,
  loginWithAppleIdToken,
  loginWithGoogleIdToken,
  loginWithSupabaseGoogleAccessToken,
  unlinkProvider as unlinkRemoteProvider,
  type AuthProfile,
  type AuthProvider,
  type AuthResponse,
  type AuthUser,
  type LinkedProvider,
} from "@/lib/api/oauthApi";

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  profile: AuthProfile | null;
  linkedProviders: LinkedProvider[];
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (input: { email: string; password: string }) => Promise<void>;
  register: (input: { email: string; password: string; displayName?: string }) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  loginWithSupabaseGoogle: (accessToken: string) => Promise<void>;
  loginWithApple: (idToken: string, input?: { displayName?: string; nonce?: string }) => Promise<void>;
  linkGoogle: (idToken: string) => Promise<void>;
  linkSupabaseGoogle: (accessToken: string) => Promise<void>;
  linkApple: (idToken: string, input?: { displayName?: string; nonce?: string }) => Promise<void>;
  unlinkProvider: (provider: Exclude<AuthProvider, "password">) => Promise<void>;
  refreshLinkedProviders: () => Promise<void>;
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
  profile: null,
  linkedProviders: [],
  isAuthenticated: Boolean(readStoredToken()),
  isAuthLoading: false,
  login: async (input) => {
    set({ isAuthLoading: true });
    try {
      const result = await apiClient.post<AuthResponse>("/v1/auth/login", input);
      storeToken(result.token);
      setAuthResult(set, result);
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
      setAuthResult(set, result);
    } catch (error) {
      set({ isAuthLoading: false });
      throw error;
    }
  },
  loginWithGoogle: async (idToken) => {
    set({ isAuthLoading: true });
    try {
      const result = await loginWithGoogleIdToken(idToken);
      storeToken(result.token);
      setAuthResult(set, result);
    } catch (error) {
      set({ isAuthLoading: false });
      throw error;
    }
  },
  loginWithSupabaseGoogle: async (accessToken) => {
    set({ isAuthLoading: true });
    try {
      const result = await loginWithSupabaseGoogleAccessToken(accessToken);
      storeToken(result.token);
      setAuthResult(set, result);
    } catch (error) {
      set({ isAuthLoading: false });
      throw error;
    }
  },
  loginWithApple: async (idToken, input) => {
    set({ isAuthLoading: true });
    try {
      const result = await loginWithAppleIdToken(idToken, input);
      storeToken(result.token);
      setAuthResult(set, result);
    } catch (error) {
      set({ isAuthLoading: false });
      throw error;
    }
  },
  linkGoogle: async (idToken) => {
    set({ isAuthLoading: true });
    try {
      const result = await linkGoogleAccount(idToken);
      storeToken(result.token);
      setAuthResult(set, result);
    } catch (error) {
      set({ isAuthLoading: false });
      throw error;
    }
  },
  linkSupabaseGoogle: async (accessToken) => {
    set({ isAuthLoading: true });
    try {
      const result = await linkSupabaseGoogleAccount(accessToken);
      storeToken(result.token);
      setAuthResult(set, result);
    } catch (error) {
      set({ isAuthLoading: false });
      throw error;
    }
  },
  linkApple: async (idToken, input) => {
    set({ isAuthLoading: true });
    try {
      const result = await linkAppleAccount(idToken, input);
      storeToken(result.token);
      setAuthResult(set, result);
    } catch (error) {
      set({ isAuthLoading: false });
      throw error;
    }
  },
  unlinkProvider: async (provider) => {
    const linkedProviders = get().linkedProviders;
    if (linkedProviders.length <= 1) {
      throw new Error("No puedes desvincular el último método de acceso.");
    }

    const result = await unlinkRemoteProvider(provider);
    set({ linkedProviders: result.linkedProviders });
  },
  refreshLinkedProviders: async () => {
    const result = await getLinkedAccounts();
    set({ linkedProviders: result.linkedProviders });
  },
  logout: () => {
    storeToken(null);
    set({ token: null, user: null, profile: null, linkedProviders: [], isAuthenticated: false, isAuthLoading: false });
  },
  loadSession: async () => {
    const token = get().token ?? readStoredToken();
    if (!token) {
      set({ token: null, user: null, profile: null, linkedProviders: [], isAuthenticated: false, isAuthLoading: false });
      return;
    }

    set({ token, isAuthLoading: true });
    try {
      const result = await apiClient.get<Omit<AuthResponse, "token">>("/v1/auth/me");
      set({
        token,
        user: result.user,
        profile: result.profile ?? null,
        linkedProviders: result.linkedProviders ?? [],
        isAuthenticated: true,
        isAuthLoading: false,
      });
    } catch {
      storeToken(null);
      set({ token: null, user: null, profile: null, linkedProviders: [], isAuthenticated: false, isAuthLoading: false });
    }
  },
}));

function setAuthResult(set: (state: Partial<AuthState>) => void, result: AuthResponse) {
  set({
    token: result.token,
    user: result.user,
    profile: result.profile ?? null,
    linkedProviders: result.linkedProviders ?? [],
    isAuthenticated: true,
    isAuthLoading: false,
  });
}

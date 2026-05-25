import { create } from "zustand";
import { apiClient, ApiError, AUTH_TOKEN_STORAGE_KEY } from "@/lib/api/client";
import { prepareOfflineCacheForUser, setIncomeSettings } from "@/lib/offline/db";
import { normalizeExpectedMonthlyIncome } from "@/lib/finance/incomeCadence";
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
import { updateProfile } from "@/services/profileApi";
import { useTransactionStore } from "@/stores/transactionStore";
import type { IncomeCadence } from "@/types/finance";

export const AUTH_SESSION_CACHE_STORAGE_KEY = "financial_management_auth_session";
export const SESSION_VALIDATION_INTERVAL_MS = 6 * 60 * 60 * 1000;

type CachedAuthSession = {
  user: AuthUser | null;
  profile: AuthProfile | null;
  linkedProviders: LinkedProvider[];
  validatedAt: number;
  cachedAt: number;
};

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
  updateIncomeSettings: (input: { expectedIncomeAmount: number; incomeCadence: IncomeCadence; monthlyBudget?: number }) => Promise<void>;
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

function readCachedAuthSession(): CachedAuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawSession = window.localStorage.getItem(AUTH_SESSION_CACHE_STORAGE_KEY);
  if (!rawSession) {
    return null;
  }

  try {
    const session = JSON.parse(rawSession) as CachedAuthSession;
    if (!session || typeof session.validatedAt !== "number") {
      return null;
    }

    return {
      user: session.user ?? null,
      profile: session.profile ?? null,
      linkedProviders: Array.isArray(session.linkedProviders) ? session.linkedProviders : [],
      validatedAt: session.validatedAt,
      cachedAt: typeof session.cachedAt === "number" ? session.cachedAt : session.validatedAt,
    };
  } catch {
    return null;
  }
}

function storeCachedAuthSession(input: {
  user: AuthUser | null;
  profile?: AuthProfile | null;
  linkedProviders?: LinkedProvider[];
  validatedAt?: number;
}) {
  if (typeof window === "undefined") {
    return;
  }

  const now = Date.now();
  const session: CachedAuthSession = {
    user: input.user,
    profile: input.profile ?? null,
    linkedProviders: input.linkedProviders ?? [],
    validatedAt: input.validatedAt ?? now,
    cachedAt: now,
  };

  window.localStorage.setItem(AUTH_SESSION_CACHE_STORAGE_KEY, JSON.stringify(session));
}

function clearCachedAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_SESSION_CACHE_STORAGE_KEY);
}

function isBrowserOnline() {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

function shouldValidateSession(cachedSession: CachedAuthSession | null) {
  if (!cachedSession) {
    return true;
  }

  return Date.now() - cachedSession.validatedAt >= SESSION_VALIDATION_INTERVAL_MS;
}

async function applyCachedSession(token: string, cachedSession: CachedAuthSession, set: (state: Partial<AuthState>) => void) {
  if (cachedSession.user?.id) {
    await prepareOfflineCacheForUser(cachedSession.user.id);
  }
  if (cachedSession.profile) {
    await syncProfileBudget(cachedSession.profile);
  }
  set({
    token,
    user: cachedSession.user,
    profile: cachedSession.profile,
    linkedProviders: cachedSession.linkedProviders,
    isAuthenticated: true,
    isAuthLoading: false,
  });
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
      await prepareOfflineCacheForUser(result.user.id);
      await syncProfileBudget(result.profile);
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
      await prepareOfflineCacheForUser(result.user.id);
      await syncProfileBudget(result.profile);
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
      await prepareOfflineCacheForUser(result.user.id);
      await syncProfileBudget(result.profile);
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
      await prepareOfflineCacheForUser(result.user.id);
      await syncProfileBudget(result.profile);
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
      await prepareOfflineCacheForUser(result.user.id);
      await syncProfileBudget(result.profile);
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
      await prepareOfflineCacheForUser(result.user.id);
      await syncProfileBudget(result.profile);
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
      await prepareOfflineCacheForUser(result.user.id);
      await syncProfileBudget(result.profile);
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
      await prepareOfflineCacheForUser(result.user.id);
      await syncProfileBudget(result.profile);
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
  updateIncomeSettings: async (input) => {
    set({ isAuthLoading: true });
    try {
      const monthlyBudget = input.monthlyBudget ?? normalizeExpectedMonthlyIncome(input.expectedIncomeAmount, input.incomeCadence);
      const result = await updateProfile({ ...input, monthlyBudget });
      await syncProfileBudget(result.profile);
      storeCachedAuthSession({
        user: result.user,
        profile: result.profile,
        linkedProviders: result.linkedProviders ?? [],
      });
      set({
        user: result.user,
        profile: result.profile,
        linkedProviders: result.linkedProviders ?? [],
        isAuthenticated: true,
        isAuthLoading: false,
      });
    } catch (error) {
      set({ isAuthLoading: false });
      throw error;
    }
  },
  refreshLinkedProviders: async () => {
    const result = await getLinkedAccounts();
    const state = get();
    storeCachedAuthSession({
      user: state.user,
      profile: state.profile,
      linkedProviders: result.linkedProviders,
    });
    set({ linkedProviders: result.linkedProviders });
  },
  logout: () => {
    storeToken(null);
    clearCachedAuthSession();
    set({ token: null, user: null, profile: null, linkedProviders: [], isAuthenticated: false, isAuthLoading: false });
  },
  loadSession: async () => {
    const token = get().token ?? readStoredToken();
    if (!token) {
      clearCachedAuthSession();
      set({ token: null, user: null, profile: null, linkedProviders: [], isAuthenticated: false, isAuthLoading: false });
      return;
    }

    const cachedSession = readCachedAuthSession();
    if (cachedSession) {
      await applyCachedSession(token, cachedSession, set);
    } else {
      set({ token, isAuthenticated: true, isAuthLoading: !isBrowserOnline() });
    }

    if (!isBrowserOnline()) {
      set({ token, isAuthenticated: true, isAuthLoading: false });
      return;
    }

    if (!shouldValidateSession(cachedSession)) {
      return;
    }

    set({ token, isAuthLoading: !cachedSession });
    try {
      const result = await apiClient.get<Omit<AuthResponse, "token">>("/v1/auth/me");
      await prepareOfflineCacheForUser(result.user.id);
      await syncProfileBudget(result.profile);
      storeCachedAuthSession({
        user: result.user,
        profile: result.profile ?? null,
        linkedProviders: result.linkedProviders ?? [],
      });
      set({
        token,
        user: result.user,
        profile: result.profile ?? null,
        linkedProviders: result.linkedProviders ?? [],
        isAuthenticated: true,
        isAuthLoading: false,
      });
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        storeToken(null);
        clearCachedAuthSession();
        set({ token: null, user: null, profile: null, linkedProviders: [], isAuthenticated: false, isAuthLoading: false });
        return;
      }

      set({
        token,
        isAuthenticated: true,
        isAuthLoading: false,
      });
    }
  },
}));

async function syncProfileBudget(profile?: AuthProfile | null) {
  if (typeof profile?.monthlyBudget !== "number") {
    await setIncomeSettings({
      monthlyBudget: 0,
      expectedIncomeAmount: 0,
      expectedMonthlyIncome: 0,
      incomeCadence: "monthly",
    });
    useTransactionStore.setState({ monthlyBudget: 0, expectedMonthlyIncome: 0 });
    return;
  }

  const expectedIncomeAmount = profile.expectedIncomeAmount ?? profile.monthlyBudget;
  const incomeCadence = profile.incomeCadence ?? "monthly";
  const expectedMonthlyIncome = normalizeExpectedMonthlyIncome(expectedIncomeAmount, incomeCadence);
  await setIncomeSettings({
    monthlyBudget: profile.monthlyBudget,
    expectedIncomeAmount,
    expectedMonthlyIncome,
    incomeCadence,
  });
  useTransactionStore.setState({ monthlyBudget: profile.monthlyBudget, expectedMonthlyIncome });
}

function setAuthResult(set: (state: Partial<AuthState>) => void, result: AuthResponse) {
  storeCachedAuthSession({
    user: result.user,
    profile: result.profile ?? null,
    linkedProviders: result.linkedProviders ?? [],
  });
  set({
    token: result.token,
    user: result.user,
    profile: result.profile ?? null,
    linkedProviders: result.linkedProviders ?? [],
    isAuthenticated: true,
    isAuthLoading: false,
  });
}

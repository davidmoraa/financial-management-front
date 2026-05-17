import { apiClient } from "@/lib/api/client";

export type AuthProvider = "google" | "apple" | "password";

export type AuthUser = {
  id: string;
  email?: string | null;
};

export type AuthProfile = {
  userId: string;
  displayName?: string | null;
  currency: string;
  monthlyBudget: number;
};

export type LinkedProvider = {
  provider: AuthProvider;
  email?: string | null;
  emailVerified: boolean;
  displayName?: string | null;
  avatarUrl?: string | null;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
  profile?: AuthProfile | null;
  linkedProviders: LinkedProvider[];
};

export function loginWithGoogleIdToken(idToken: string) {
  return apiClient.post<AuthResponse>("/v1/oauth/google/login", { idToken });
}

export function loginWithSupabaseGoogleAccessToken(accessToken: string) {
  return apiClient.post<AuthResponse>("/v1/oauth/google/login", { accessToken });
}

export function loginWithAppleIdToken(idToken: string, input?: { nonce?: string; displayName?: string }) {
  return apiClient.post<AuthResponse>("/v1/oauth/apple/login", { idToken, ...input });
}

export function linkGoogle(idToken: string) {
  return apiClient.post<AuthResponse>("/v1/oauth/google/link", { idToken });
}

export function linkSupabaseGoogle(accessToken: string) {
  return apiClient.post<AuthResponse>("/v1/oauth/google/link", { accessToken });
}

export function linkApple(idToken: string, input?: { nonce?: string; displayName?: string }) {
  return apiClient.post<AuthResponse>("/v1/oauth/apple/link", { idToken, ...input });
}

export function getLinkedAccounts() {
  return apiClient.get<{ linkedProviders: LinkedProvider[] }>("/v1/oauth/accounts");
}

export function unlinkProvider(provider: Exclude<AuthProvider, "password">) {
  return apiClient.delete<{ linkedProviders: LinkedProvider[] }>(`/v1/oauth/accounts/${provider}`);
}

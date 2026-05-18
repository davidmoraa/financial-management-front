import { apiClient } from "@/lib/api/client";
import type { AuthProfile, AuthUser, LinkedProvider } from "@/lib/api/oauthApi";
import type { IncomeCadence } from "@/types/finance";

type ProfileResponse = {
  user: AuthUser;
  profile: AuthProfile;
  linkedProviders: LinkedProvider[];
};

export function updateProfile(input: { monthlyBudget?: number; expectedIncomeAmount: number; incomeCadence: IncomeCadence }) {
  return apiClient.patch<ProfileResponse>("/v1/auth/profile", input);
}

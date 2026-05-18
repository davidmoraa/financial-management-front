import { apiClient } from "@/lib/api/client";
import type { AuthProfile, AuthUser, LinkedProvider } from "@/lib/api/oauthApi";

type ProfileResponse = {
  user: AuthUser;
  profile: AuthProfile;
  linkedProviders: LinkedProvider[];
};

export function updateProfile(input: { monthlyBudget: number }) {
  return apiClient.patch<ProfileResponse>("/v1/auth/profile", input);
}

import { apiClient } from "@/lib/api/client";
import type { SavingMilestone, SavingMilestoneInput } from "@/types/savingMilestones";

type SavingMilestonesResponse = {
  savingMilestones: SavingMilestone[];
};

type SavingMilestoneResponse = {
  savingMilestone: SavingMilestone;
};

export async function fetchSavingMilestones() {
  const response = await apiClient.get<SavingMilestonesResponse>("/v1/saving-milestones");
  return response.savingMilestones;
}

export async function createRemoteSavingMilestone(input: SavingMilestoneInput) {
  const response = await apiClient.post<SavingMilestoneResponse>("/v1/saving-milestones", input);
  return response.savingMilestone;
}

export async function updateRemoteSavingMilestone(id: string, input: Partial<SavingMilestoneInput>) {
  const response = await apiClient.patch<SavingMilestoneResponse>(`/v1/saving-milestones/${id}`, input);
  return response.savingMilestone;
}

export async function deleteRemoteSavingMilestone(id: string) {
  const response = await apiClient.delete<SavingMilestoneResponse>(`/v1/saving-milestones/${id}`);
  return response.savingMilestone;
}

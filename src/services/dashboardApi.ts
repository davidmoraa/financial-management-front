import { apiClient } from "@/lib/api/client";
import type { DashboardSummaryResponse } from "@/types/dashboard";

export async function fetchDashboardSummary(month?: string) {
  const query = month ? `?month=${encodeURIComponent(month)}` : "";
  const response = await apiClient.get<DashboardSummaryResponse>(`/v1/dashboard/summary${query}`);
  return response.summary;
}

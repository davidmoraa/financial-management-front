import { apiClient } from "@/lib/api/client";
import type { AnalyticsSummaryResponse } from "@/types/analytics";

export async function fetchAnalyticsSummary(period: string) {
  const params = new URLSearchParams({ period });
  const timeZone = getBrowserTimeZone();

  if (timeZone) {
    params.set("timeZone", timeZone);
  }

  const response = await apiClient.get<AnalyticsSummaryResponse>(`/v1/analytics/summary?${params.toString()}`);
  return response.summary;
}

function getBrowserTimeZone() {
  if (typeof Intl === "undefined") {
    return undefined;
  }

  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
}

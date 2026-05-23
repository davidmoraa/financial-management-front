import { apiClient } from "@/lib/api/client";
import type { ProjectionSimulationRequest, ProjectionSimulationResponse } from "@/types/projections";

export async function simulateProjection(input: ProjectionSimulationRequest) {
  const response = await apiClient.post<ProjectionSimulationResponse>("/v1/projections/simulate", input);
  return response.simulation;
}

import { useEffect, useState } from "react";
import { fetchDashboardSummary } from "@/services/dashboardApi";
import type { DashboardSummary } from "@/types/dashboard";

type DashboardSummaryState = {
  data?: DashboardSummary;
  error?: Error;
  isLoading: boolean;
};

export function useDashboardSummary(month: string) {
  const [state, setState] = useState<DashboardSummaryState>({ isLoading: true });

  useEffect(() => {
    let cancelled = false;

    setState((current) => ({ data: current.data, isLoading: true }));

    fetchDashboardSummary(month)
      .then((summary) => {
        if (!cancelled) {
          setState({ data: summary, isLoading: false });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            error: error instanceof Error ? error : new Error("No se pudo cargar el dashboard."),
            isLoading: false,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [month]);

  return state;
}

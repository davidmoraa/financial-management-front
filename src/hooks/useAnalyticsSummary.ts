import { useEffect, useState } from "react";
import { fetchAnalyticsSummary } from "@/services/analyticsApi";
import type { AnalyticsSummary } from "@/types/analytics";

type AnalyticsSummaryState = {
  data?: AnalyticsSummary;
  error?: Error;
  isLoading: boolean;
};

export function useAnalyticsSummary(period: string) {
  const [state, setState] = useState<AnalyticsSummaryState>({ isLoading: true });

  useEffect(() => {
    let cancelled = false;

    setState((current) => ({
      data: current.data,
      error: undefined,
      isLoading: true,
    }));

    fetchAnalyticsSummary(period)
      .then((summary) => {
        if (!cancelled) {
          setState({ data: summary, isLoading: false });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            error: error instanceof Error ? error : new Error("No se pudo cargar el análisis."),
            isLoading: false,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [period]);

  return state;
}

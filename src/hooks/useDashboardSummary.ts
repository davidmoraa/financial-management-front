import { useEffect, useState } from "react";
import { buildLocalDashboardSummary } from "@/lib/dashboard/localDashboardSummary";
import { fetchDashboardSummary } from "@/services/dashboardApi";
import { useAuthStore } from "@/stores/authStore";
import { useFixedExpenseStore } from "@/stores/fixedExpenseStore";
import { useTransactionStore } from "@/stores/transactionStore";
import type { DashboardPeriod, DashboardSummary } from "@/types/dashboard";

type DashboardSummaryState = {
  data?: DashboardSummary;
  error?: Error;
  isLoading: boolean;
};

type RemoteDashboardSummaryState = {
  error?: Error;
  isLoading: boolean;
  month?: string;
  summary?: DashboardSummary;
};

export function useDashboardSummary(month: string, period?: DashboardPeriod) {
  const [state, setState] = useState<DashboardSummaryState>({ isLoading: true });
  const [remoteState, setRemoteState] = useState<RemoteDashboardSummaryState>({ isLoading: true });
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const transactionVersion = useTransactionStore((store) =>
    store.transactions.map((transaction) => `${transaction.id}:${transaction.updatedAt}:${transaction.deletedAt ?? ""}`).join("|"),
  );
  const fixedExpenseVersion = useFixedExpenseStore((store) =>
    store.fixedExpenses.map((fixedExpense) => `${fixedExpense.id}:${fixedExpense.updatedAt}:${fixedExpense.deletedAt ?? ""}`).join("|"),
  );
  const occurrenceVersion = useFixedExpenseStore((store) =>
    store.occurrences.map((occurrence) => `${occurrence.id}:${occurrence.updatedAt}:${occurrence.deletedAt ?? ""}`).join("|"),
  );
  const monthlyBudget = useTransactionStore((store) => store.monthlyBudget);
  const expectedMonthlyIncome = useTransactionStore((store) => store.expectedMonthlyIncome);

  useEffect(() => {
    // Wait for auth to settle before hitting the API.
    // Without this guard the request goes out without an Authorization header
    // (race condition: loadSession() hasn't finished yet), gets a 401, and the
    // dashboard shows the red error card even though the user is authenticated.
    if (!isAuthenticated || isAuthLoading) {
      setRemoteState((current) => ({
        ...current,
        isLoading: isAuthLoading,
      }));
      return;
    }

    let cancelled = false;

    setRemoteState((current) => ({
      error: undefined,
      isLoading: true,
      month,
      summary: current.month === month ? current.summary : undefined,
    }));

    async function loadRemoteSummary() {
      try {
        const summary = await fetchDashboardSummary(month);
        if (!cancelled) {
          setRemoteState({
            error: undefined,
            isLoading: false,
            month,
            summary,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setRemoteState((current) => ({
            error: error instanceof Error ? error : new Error("No se pudo cargar el dashboard."),
            isLoading: false,
            month,
            summary: current.month === month ? current.summary : undefined,
          }));
        }
      }
    }

    loadRemoteSummary()
      .catch((error: unknown) => {
        if (!cancelled) {
          setRemoteState({
            error: error instanceof Error ? error : new Error("No se pudo cargar el dashboard."),
            isLoading: false,
            month,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isAuthLoading, month]);

  useEffect(() => {
    let cancelled = false;

    async function composeDashboardSummary() {
      const isRemoteForRequestedMonth = remoteState.month === month;
      const remoteSummary = isRemoteForRequestedMonth ? remoteState.summary : undefined;
      const localSummary = await buildLocalDashboardSummary(month, { period, remoteSummary });

      if (cancelled) {
        return;
      }

      const summary = localSummary ?? remoteSummary;
      if (summary) {
        setState({
          data: summary,
          error: isRemoteForRequestedMonth ? remoteState.error : undefined,
          isLoading: false,
        });
        return;
      }

      if (!isRemoteForRequestedMonth || remoteState.isLoading) {
        setState((current) => ({
          data: current.data,
          error: undefined,
          isLoading: true,
        }));
        return;
      }

      setState({
        error: remoteState.error ?? new Error("No se pudo cargar el dashboard."),
        isLoading: false,
      });
    }

    composeDashboardSummary()
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
  }, [
    expectedMonthlyIncome,
    fixedExpenseVersion,
    month,
    monthlyBudget,
    occurrenceVersion,
    period?.endsAt,
    period?.startsAt,
    period?.type,
    remoteState.error,
    remoteState.isLoading,
    remoteState.month,
    remoteState.summary,
    transactionVersion,
  ]);

  return state;
}

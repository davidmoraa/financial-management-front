import { useEffect, useState } from "react";
import { buildLocalDashboardSummary } from "@/lib/dashboard/localDashboardSummary";
import { fetchDashboardSummary } from "@/services/dashboardApi";
import { useFixedExpenseStore } from "@/stores/fixedExpenseStore";
import { useTransactionStore } from "@/stores/transactionStore";
import type { DashboardPeriod, DashboardSummary } from "@/types/dashboard";

type DashboardSummaryState = {
  data?: DashboardSummary;
  error?: Error;
  isLoading: boolean;
};

export function useDashboardSummary(month: string, period?: DashboardPeriod) {
  const [state, setState] = useState<DashboardSummaryState>({ isLoading: true });
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
    let cancelled = false;

    setState((current) => ({ data: current.data, isLoading: true }));

    async function loadDashboardSummary() {
      let remoteSummary: DashboardSummary | undefined;
      let remoteError: Error | undefined;

      try {
        remoteSummary = await fetchDashboardSummary(month);
      } catch (error) {
        remoteError = error instanceof Error ? error : new Error("No se pudo cargar el dashboard.");
      }

      const localSummary = await buildLocalDashboardSummary(month, { period, remoteSummary });

      if (!cancelled) {
        const summary = localSummary ?? remoteSummary;
        if (summary) {
          setState({
            data: summary,
            error: undefined,
            isLoading: false,
          });
          return;
        }

        setState({
          error: remoteError ?? new Error("No se pudo cargar el dashboard."),
          isLoading: false,
        });
      }
    }

    loadDashboardSummary()
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
    transactionVersion,
  ]);

  return state;
}

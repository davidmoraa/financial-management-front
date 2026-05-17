import { apiClient } from "@/lib/api/client";
import type { Transaction } from "@/types/finance";
import type { BudgetWarning, FixedExpense } from "@/types/fixedExpenses";

export type DashboardSummary = {
  period: {
    month: string;
    start: string;
    end: string;
  };
  balance: number;
  incomeTotal: number;
  expenseTotal: number;
  fixedExpenseTotal: number;
  variableExpenseTotal: number;
  forecast: {
    pendingFixedExpenseTotal: number;
    projectedMonthEndExpenses: number;
    projectedBalance: number;
  };
  warnings: BudgetWarning[];
  upcomingFixedExpenses: Array<Omit<FixedExpense, "syncStatus">>;
  recentTransactions: Array<Omit<Transaction, "syncStatus">>;
};

type DashboardSummaryResponse = {
  summary: DashboardSummary;
};

export async function fetchDashboardSummary(month?: string) {
  const query = month ? `?month=${encodeURIComponent(month)}` : "";
  const response = await apiClient.get<DashboardSummaryResponse>(`/v1/dashboard/summary${query}`);
  return response.summary;
}

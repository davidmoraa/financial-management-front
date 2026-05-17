import { apiClient } from "@/lib/api/client";
import type { FixedExpense, FixedExpenseOccurrence } from "@/types/fixedExpenses";

export type RemoteFixedExpense = Omit<FixedExpense, "syncStatus">;
export type RemoteFixedExpenseOccurrence = Omit<FixedExpenseOccurrence, "syncStatus">;

type FixedExpensesResponse = {
  fixedExpenses: RemoteFixedExpense[];
};

type FixedExpenseOccurrencesResponse = {
  occurrences: RemoteFixedExpenseOccurrence[];
};

export async function fetchFixedExpenses() {
  const response = await apiClient.get<FixedExpensesResponse>("/v1/fixed-expenses");
  return response.fixedExpenses;
}

export async function fetchFixedExpenseOccurrences(occurrenceMonth?: string) {
  const query = occurrenceMonth ? `?occurrenceMonth=${encodeURIComponent(occurrenceMonth)}` : "";
  const response = await apiClient.get<FixedExpenseOccurrencesResponse>(`/v1/fixed-expense-occurrences${query}`);
  return response.occurrences;
}

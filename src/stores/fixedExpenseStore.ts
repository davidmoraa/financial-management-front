import { create } from "zustand";
import {
  createFixedExpense,
  getAllFixedExpenses,
  softDeleteFixedExpense,
  updateFixedExpense,
  type FixedExpenseMutationInput,
} from "@/lib/offline/fixedExpenseRepository";
import {
  getOccurrencesByMonth,
  markFixedExpensePaid,
  monthStartIso,
  skipFixedExpenseForMonth,
  type MarkFixedExpensePaidInput,
  type SkipFixedExpenseInput,
} from "@/lib/offline/fixedExpenseOccurrenceRepository";
import { ensureOfflineDatabaseReady, financeDb } from "@/lib/offline/db";
import type { FixedExpense, FixedExpenseOccurrence } from "@/types/fixedExpenses";
import { useTransactionStore } from "@/stores/transactionStore";
import { getPendingCount, getFailedCount } from "@/lib/offline/syncQueueRepository";

type FixedExpenseState = {
  fixedExpenses: FixedExpense[];
  occurrences: FixedExpenseOccurrence[];
  isHydrated: boolean;
  isHydrating: boolean;
  hydrate: (targetMonth?: Date) => Promise<void>;
  refreshFixedExpenses: () => Promise<void>;
  refreshOccurrences: (targetMonth?: Date) => Promise<void>;
  refreshAll: (targetMonth?: Date) => Promise<void>;
  createFixedExpense: (input: FixedExpenseMutationInput) => Promise<FixedExpense>;
  updateFixedExpense: (id: string, input: FixedExpenseMutationInput) => Promise<FixedExpense>;
  deleteFixedExpense: (id: string) => Promise<void>;
  markPaid: (input: MarkFixedExpensePaidInput) => Promise<void>;
  skipThisMonth: (input: SkipFixedExpenseInput) => Promise<void>;
};

async function refreshSyncCounts() {
  const [pendingSyncCount, failedSyncCount] = await Promise.all([getPendingCount(), getFailedCount()]);
  useTransactionStore.setState({ pendingSyncCount, failedSyncCount });
}

export const useFixedExpenseStore = create<FixedExpenseState>((set, get) => ({
  fixedExpenses: [],
  occurrences: [],
  isHydrated: false,
  isHydrating: false,
  hydrate: async (targetMonth = new Date()) => {
    if (get().isHydrating) {
      return;
    }

    set({ isHydrating: true });
    await ensureOfflineDatabaseReady();
    const [fixedExpenses, occurrences] = await Promise.all([getAllFixedExpenses(), getOccurrencesByMonth(targetMonth)]);
    set({ fixedExpenses, occurrences, isHydrated: true, isHydrating: false });
  },
  refreshFixedExpenses: async () => {
    const fixedExpenses = await getAllFixedExpenses();
    set({ fixedExpenses });
  },
  refreshOccurrences: async (targetMonth = new Date()) => {
    const occurrences = await getOccurrencesByMonth(targetMonth);
    set({ occurrences });
  },
  refreshAll: async (targetMonth = new Date()) => {
    const [fixedExpenses, occurrences] = await Promise.all([getAllFixedExpenses(), getOccurrencesByMonth(targetMonth)]);
    set({ fixedExpenses, occurrences, isHydrated: true });
    await refreshSyncCounts();
  },
  createFixedExpense: async (input) => {
    const fixedExpense = await createFixedExpense(input);
    await get().refreshAll();
    return fixedExpense;
  },
  updateFixedExpense: async (id, input) => {
    const fixedExpense = await updateFixedExpense(id, input);
    await get().refreshAll();
    return fixedExpense;
  },
  deleteFixedExpense: async (id) => {
    await softDeleteFixedExpense(id);
    await get().refreshAll();
  },
  markPaid: async (input) => {
    await markFixedExpensePaid(input);
    await Promise.all([
      get().refreshAll(new Date(`${input.occurrenceMonth}T00:00:00`)),
      useTransactionStore.getState().refreshTransactions(),
    ]);
  },
  skipThisMonth: async (input) => {
    await skipFixedExpenseForMonth(input);
    await get().refreshAll(new Date(`${input.occurrenceMonth}T00:00:00`));
  },
}));

export async function loadAllFixedExpenseOccurrencesForSync() {
  return financeDb.fixedExpenseOccurrences.filter((occurrence) => !occurrence.deletedAt).toArray();
}

export { monthStartIso };

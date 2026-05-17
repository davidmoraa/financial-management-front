import { create } from "zustand";
import {
  cacheRemoteFixedExpenses,
  createFixedExpense,
  getAllFixedExpenses,
  softDeleteFixedExpense,
  updateFixedExpense,
  type FixedExpenseMutationInput,
} from "@/lib/offline/fixedExpenseRepository";
import {
  cacheRemoteFixedExpenseOccurrences,
  getOccurrencesByMonth,
  markFixedExpensePaid,
  monthStartIso,
  skipFixedExpenseForMonth,
  type MarkFixedExpensePaidInput,
  type SkipFixedExpenseInput,
} from "@/lib/offline/fixedExpenseOccurrenceRepository";
import { AUTH_TOKEN_STORAGE_KEY } from "@/lib/api/client";
import { ensureOfflineDatabaseReady, financeDb } from "@/lib/offline/db";
import { fetchFixedExpenseOccurrences, fetchFixedExpenses } from "@/services/fixedExpensesApi";
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

function canFetchRemoteData() {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)) && window.navigator.onLine;
}

async function refreshRemoteFixedExpenseCache(targetMonth: Date) {
  if (!canFetchRemoteData()) {
    return;
  }

  try {
    const month = monthStartIso(targetMonth);
    const [fixedExpenses, occurrences] = await Promise.all([
      fetchFixedExpenses(),
      fetchFixedExpenseOccurrences(month),
    ]);
    await Promise.all([
      cacheRemoteFixedExpenses(fixedExpenses),
      cacheRemoteFixedExpenseOccurrences(occurrences),
    ]);
  } catch {
    // Keep the current IndexedDB cache available when remote data is unavailable.
  }
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
    await refreshRemoteFixedExpenseCache(targetMonth);
    const [fixedExpenses, occurrences] = await Promise.all([getAllFixedExpenses(), getOccurrencesByMonth(targetMonth)]);
    set({ fixedExpenses, occurrences, isHydrated: true, isHydrating: false });
  },
  refreshFixedExpenses: async () => {
    if (canFetchRemoteData()) {
      try {
        await cacheRemoteFixedExpenses(await fetchFixedExpenses());
      } catch {
        // Keep cached data.
      }
    }
    const fixedExpenses = await getAllFixedExpenses();
    set({ fixedExpenses });
  },
  refreshOccurrences: async (targetMonth = new Date()) => {
    if (canFetchRemoteData()) {
      try {
        await cacheRemoteFixedExpenseOccurrences(await fetchFixedExpenseOccurrences(monthStartIso(targetMonth)));
      } catch {
        // Keep cached data.
      }
    }
    const occurrences = await getOccurrencesByMonth(targetMonth);
    set({ occurrences });
  },
  refreshAll: async (targetMonth = new Date()) => {
    await refreshRemoteFixedExpenseCache(targetMonth);
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

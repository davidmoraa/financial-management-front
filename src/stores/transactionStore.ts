import { create } from "zustand";
import { isSameMonth, parseISO } from "date-fns";
import {
  cacheRemoteTransactions,
  createTransaction,
  getAllTransactions,
  getRecentTransactions as getRecentTransactionsFromDb,
  getTransactionsByMonth as getTransactionsByMonthFromDb,
  softDeleteTransaction,
  updateTransaction,
  type TransactionMutationInput,
} from "@/lib/offline/transactionRepository";
import { AUTH_TOKEN_STORAGE_KEY } from "@/lib/api/client";
import { ensureOfflineDatabaseReady, getExpectedMonthlyIncomeSetting, getMonthlyBudgetSetting } from "@/lib/offline/db";
import { getFailedCount, getPendingCount } from "@/lib/offline/syncQueueRepository";
import { fetchTransactions } from "@/services/transactionsApi";
import type { MonthlySummary, Transaction } from "@/types/finance";
import type { TransactionFormValues } from "@/schemas/transactionSchema";
import { useCategoryStore } from "@/stores/categoryStore";

type TransactionState = {
  transactions: Transaction[];
  monthlyBudget: number;
  expectedMonthlyIncome: number;
  isHydrated: boolean;
  isHydrating: boolean;
  isSyncing: boolean;
  pendingSyncCount: number;
  failedSyncCount: number;
  setIsSyncing: (isSyncing: boolean) => void;
  hydrate: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  refreshSyncCounts: () => Promise<void>;
  addTransaction: (values: TransactionFormValues) => Promise<Transaction>;
  updateTransaction: (id: string, values: TransactionFormValues) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  getTransactionsByMonth: (date: Date) => Transaction[];
  getRecentTransactions: (limit?: number) => Transaction[];
  getMonthlySummary: (date: Date) => MonthlySummary;
};

function toMutationInput(values: TransactionFormValues): TransactionMutationInput {
  const category = useCategoryStore.getState().getCategoryById(values.categoryId);

  return {
    type: values.type,
    amount: values.amount,
    categoryId: values.categoryId,
    categoryName: category?.name ?? "Sin categoría",
    paymentMethod: values.paymentMethod,
    creditCardId: values.paymentMethod === "credit_card" ? values.creditCardId : undefined,
    transactionDate: values.transactionDate,
    note: values.note,
  };
}

async function loadLocalState() {
  await ensureOfflineDatabaseReady();
  if (canFetchRemoteData()) {
    try {
      await cacheRemoteTransactions(await fetchTransactions());
    } catch {
      // Keep the last local cache available for offline/error states.
    }
  }

  const [transactions, monthlyBudget, pendingSyncCount, failedSyncCount] = await Promise.all([
    getAllTransactions(),
    getMonthlyBudgetSetting(),
    getPendingCount(),
    getFailedCount(),
  ]);
  const expectedMonthlyIncome = await getExpectedMonthlyIncomeSetting();

  return { transactions, monthlyBudget, expectedMonthlyIncome, pendingSyncCount, failedSyncCount };
}

function canFetchRemoteData() {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)) && window.navigator.onLine;
}

function canAttemptImmediateRemoteWrite() {
  return canFetchRemoteData();
}

async function syncImmediatelyIfPossible() {
  if (!canAttemptImmediateRemoteWrite()) {
    return;
  }

  try {
    const { syncPendingItems } = await import("@/lib/offline/syncEngine");
    await syncPendingItems();
  } catch {
    // The local write and syncQueue item are already persisted. A later sync retry will pick them up.
  }
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  monthlyBudget: 0,
  expectedMonthlyIncome: 0,
  isHydrated: false,
  isHydrating: false,
  isSyncing: false,
  pendingSyncCount: 0,
  failedSyncCount: 0,
  setIsSyncing: (isSyncing) => set({ isSyncing }),
  hydrate: async () => {
    if (get().isHydrating) {
      return;
    }

    set({ isHydrating: true });
    const localState = await loadLocalState();
    set({ ...localState, isHydrated: true, isHydrating: false });
  },
  refreshTransactions: async () => {
    const [transactions, pendingSyncCount, failedSyncCount] = await Promise.all([
      getAllTransactions(),
      getPendingCount(),
      getFailedCount(),
    ]);

    set({ transactions, pendingSyncCount, failedSyncCount });
  },
  refreshSyncCounts: async () => {
    const [pendingSyncCount, failedSyncCount] = await Promise.all([getPendingCount(), getFailedCount()]);
    set({ pendingSyncCount, failedSyncCount });
  },
  addTransaction: async (values) => {
    const transaction = await createTransaction(toMutationInput(values));
    await syncImmediatelyIfPossible();
    const [transactions, pendingSyncCount, failedSyncCount] = await Promise.all([
      getAllTransactions(),
      getPendingCount(),
      getFailedCount(),
    ]);
    set({ transactions, pendingSyncCount, failedSyncCount, isHydrated: true });
    return transaction;
  },
  updateTransaction: async (id, values) => {
    const transaction = await updateTransaction(id, toMutationInput(values));
    await syncImmediatelyIfPossible();
    await get().refreshTransactions();
    return transaction;
  },
  deleteTransaction: async (id) => {
    await softDeleteTransaction(id);
    await syncImmediatelyIfPossible();
    await get().refreshTransactions();
  },
  getTransactionsByMonth: (date) =>
    get()
      .transactions.filter((transaction) => !transaction.deletedAt && isSameMonth(parseISO(transaction.transactionDate), date))
      .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()),
  getRecentTransactions: (limit = 5) =>
    [...get().transactions]
      .filter((transaction) => !transaction.deletedAt)
      .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
      .slice(0, limit),
  getMonthlySummary: (date) => {
    const monthTransactions = get().getTransactionsByMonth(date);
    const income = monthTransactions
      .filter((transaction) => transaction.type === "income")
      .reduce((total, transaction) => total + transaction.amount, 0);
    const expense = monthTransactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((total, transaction) => total + transaction.amount, 0);
    const budget = get().monthlyBudget;
    const expectedIncome = get().expectedMonthlyIncome;
    const incomeBasis = Math.max(income, expectedIncome);

    return {
      income: incomeBasis,
      actualIncome: income,
      expectedIncome,
      expense,
      balance: incomeBasis - expense,
      budget,
      budgetUsedPercentage: budget > 0 ? Math.round((expense / budget) * 100) : 0,
    };
  },
}));

export async function loadTransactionsByMonthFromIndexedDb(date: Date) {
  return getTransactionsByMonthFromDb(date);
}

export async function loadRecentTransactionsFromIndexedDb(limit?: number) {
  return getRecentTransactionsFromDb(limit);
}

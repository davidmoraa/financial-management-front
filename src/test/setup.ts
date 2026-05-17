import "@testing-library/jest-dom/vitest";
import "fake-indexeddb/auto";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { resetOfflineDatabaseForTests } from "@/lib/offline/db";
import { useNetworkStore } from "@/stores/networkStore";
import { useAuthStore } from "@/stores/authStore";
import { useCategoryStore } from "@/stores/categoryStore";
import { useFixedExpenseStore } from "@/stores/fixedExpenseStore";
import { useTransactionStore } from "@/stores/transactionStore";

if (!globalThis.crypto?.randomUUID) {
  Object.defineProperty(globalThis, "crypto", {
    value: {
      randomUUID: () => `test-${Math.random().toString(16).slice(2)}`,
    },
  });
}

afterEach(async () => {
  cleanup();
  await resetOfflineDatabaseForTests();
  useTransactionStore.setState({
    transactions: [],
    monthlyBudget: 15000,
    isHydrated: false,
    isHydrating: false,
    isSyncing: false,
    pendingSyncCount: 0,
    failedSyncCount: 0,
  });
  useAuthStore.setState({
    token: null,
    user: null,
    profile: null,
    linkedProviders: [],
    isAuthenticated: false,
    isAuthLoading: false,
  });
  window.sessionStorage.clear();
  useFixedExpenseStore.setState({
    fixedExpenses: [],
    occurrences: [],
    isHydrated: false,
    isHydrating: false,
  });
  useCategoryStore.setState({
    categories: [],
    isHydrated: false,
    isHydrating: false,
  });
  window.localStorage.clear();
  useNetworkStore.setState({
    isOnline: true,
    lastOnlineAt: new Date().toISOString(),
    lastOfflineAt: undefined,
  });
  vi.restoreAllMocks();
});

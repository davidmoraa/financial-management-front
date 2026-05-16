import "@testing-library/jest-dom/vitest";
import "fake-indexeddb/auto";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { resetOfflineDatabaseForTests } from "@/lib/offline/db";
import { useNetworkStore } from "@/stores/networkStore";
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
    pendingSyncCount: 0,
    failedSyncCount: 0,
  });
  useNetworkStore.setState({
    isOnline: true,
    lastOnlineAt: new Date().toISOString(),
    lastOfflineAt: undefined,
  });
  vi.restoreAllMocks();
});

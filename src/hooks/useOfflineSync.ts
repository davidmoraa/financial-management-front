import { useEffect, useRef } from "react";
import { syncPendingItems } from "@/lib/offline/syncEngine";
import { useAuthStore } from "@/stores/authStore";
import { useFixedExpenseStore } from "@/stores/fixedExpenseStore";
import { useNetworkStore } from "@/stores/networkStore";
import { useTransactionStore } from "@/stores/transactionStore";

export function useOfflineSync() {
  const isOnline = useNetworkStore((state) => state.isOnline);
  const initializeNetworkListeners = useNetworkStore((state) => state.initializeNetworkListeners);
  const pendingSyncCount = useTransactionStore((state) => state.pendingSyncCount);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const syncInFlight = useRef(false);

  useEffect(() => {
    const cleanupNetworkListeners = initializeNetworkListeners();
    void Promise.all([
      useTransactionStore.getState().hydrate(),
      useFixedExpenseStore.getState().hydrate(),
    ]).then(() => {
      void useTransactionStore.getState().refreshSyncCounts();
    });

    return cleanupNetworkListeners;
  }, [initializeNetworkListeners]);

  useEffect(() => {
    if (!isAuthenticated || !isOnline || syncInFlight.current) {
      return;
    }

    syncInFlight.current = true;

    void syncPendingItems()
      .finally(async () => {
        await Promise.all([
          useTransactionStore.getState().refreshTransactions(),
          useFixedExpenseStore.getState().refreshAll(),
        ]);
        syncInFlight.current = false;
      });
  }, [isAuthenticated, isOnline, pendingSyncCount]);
}

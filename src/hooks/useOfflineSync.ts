import { useEffect, useRef } from "react";
import { syncPendingItems } from "@/lib/offline/syncEngine";
import { useNetworkStore } from "@/stores/networkStore";
import { useTransactionStore } from "@/stores/transactionStore";

export function useOfflineSync() {
  const isOnline = useNetworkStore((state) => state.isOnline);
  const initializeNetworkListeners = useNetworkStore((state) => state.initializeNetworkListeners);
  const pendingSyncCount = useTransactionStore((state) => state.pendingSyncCount);
  const failedSyncCount = useTransactionStore((state) => state.failedSyncCount);
  const syncInFlight = useRef(false);

  useEffect(() => {
    const cleanupNetworkListeners = initializeNetworkListeners();
    void useTransactionStore.getState().hydrate().then(() => {
      void useTransactionStore.getState().refreshSyncCounts();
    });

    return cleanupNetworkListeners;
  }, [initializeNetworkListeners]);

  useEffect(() => {
    if (!isOnline || syncInFlight.current || pendingSyncCount + failedSyncCount === 0) {
      return;
    }

    syncInFlight.current = true;

    void syncPendingItems()
      .finally(async () => {
        await useTransactionStore.getState().refreshTransactions();
        syncInFlight.current = false;
      });
  }, [failedSyncCount, isOnline, pendingSyncCount]);
}

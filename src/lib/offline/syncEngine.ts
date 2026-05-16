import { getLastPulledAt, getOrCreateDeviceId, setLastPulledAt } from "@/lib/offline/db";
import {
  getPendingSyncItems,
  hasPendingSyncForEntity,
  markSyncItemDone,
  markSyncItemFailed,
  markSyncItemProcessing,
} from "@/lib/offline/syncQueueRepository";
import { markTransactionConflict, markTransactionSyncStatus, mergeRemoteTransaction } from "@/lib/offline/transactionRepository";
import { pullRemoteChanges, pushSyncOperations } from "@/lib/remote/syncApi";
import { useAuthStore } from "@/stores/authStore";
import { useTransactionStore } from "@/stores/transactionStore";
import type { SyncQueueItem } from "@/types/finance";

let isSyncing = false;

export function canSync() {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

export async function syncPendingItems() {
  if (isSyncing || !canSync()) {
    return { processed: 0 };
  }

  if (!useAuthStore.getState().token) {
    return { processed: 0 };
  }

  isSyncing = true;
  useTransactionStore.getState().setIsSyncing(true);
  const items = await getPendingSyncItems();

  try {
    for (const item of items) {
      await markSyncItemProcessing(item.id);
      if (item.entity === "transaction") {
        await markTransactionSyncStatus(item.entityId, "syncing");
      }
    }

    if (items.length > 0) {
      const deviceId = await getOrCreateDeviceId();
      const pushResult = await pushSyncOperations({ deviceId, operations: items });

      for (const accepted of pushResult.accepted) {
        await markSyncItemDone(accepted.operationId);
        await markTransactionSyncStatus(accepted.entityId, "synced", pushResult.serverTime);
      }

      for (const failed of pushResult.failed) {
        await markSyncItemFailed(failed.operationId, failed.message);
        await markTransactionSyncStatus(failed.entityId, "failed");
      }

      for (const conflict of pushResult.conflicts) {
        await markSyncItemFailed(conflict.operationId, "Conflict reported by server");
        await markTransactionConflict(conflict.entityId);
      }
    }

    const pullResult = await pullRemoteChanges(await getLastPulledAt());

    for (const remoteTransaction of pullResult.transactions) {
      const hasLocalPending = await hasPendingSyncForEntity(remoteTransaction.id);
      if (hasLocalPending) {
        await markTransactionConflict(remoteTransaction.id);
      } else {
        await mergeRemoteTransaction(remoteTransaction);
      }
    }

    await setLastPulledAt(pullResult.serverTime);
    await useTransactionStore.getState().refreshTransactions();

    return { processed: items.length };
  } catch (error) {
    for (const item of items) {
      if (item.entity === "transaction") {
        await markTransactionSyncStatus(item.entityId, "failed");
      }
      await markSyncItemFailed(item.id, error);
    }
    await useTransactionStore.getState().refreshTransactions();
    return { processed: 0 };
  } finally {
    isSyncing = false;
    useTransactionStore.getState().setIsSyncing(false);
  }
}

export async function processSyncItem(item: SyncQueueItem) {
  if (item.entity !== "transaction") {
    throw new Error(`Unsupported sync entity: ${item.entity}`);
  }

  return syncPendingItems();
}

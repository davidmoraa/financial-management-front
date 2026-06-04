import { getLastPulledAt, getOrCreateDeviceId, setLastPulledAt } from "@/lib/offline/db";
import {
  clearDoneItems,
  getPendingSyncItems,
  hasPendingSyncForEntity,
  markSyncItemDone,
  markSyncItemFailed,
  markSyncItemProcessing,
} from "@/lib/offline/syncQueueRepository";
import {
  markFixedExpenseConflict,
  markFixedExpenseSyncStatus,
  mergeRemoteFixedExpense,
} from "@/lib/offline/fixedExpenseRepository";
import {
  markFixedExpenseOccurrenceConflict,
  markFixedExpenseOccurrenceSyncStatus,
  mergeRemoteFixedExpenseOccurrence,
} from "@/lib/offline/fixedExpenseOccurrenceRepository";
import { markTransactionConflict, markTransactionSyncStatus, mergeRemoteTransaction } from "@/lib/offline/transactionRepository";
import { pullRemoteChanges, pushSyncOperations } from "@/lib/remote/syncApi";
import { useAuthStore } from "@/stores/authStore";
import { useFixedExpenseStore } from "@/stores/fixedExpenseStore";
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

  // Track items resolved by push so the catch block does not re-mark them as failed.
  const resolvedItemIds = new Set<string>();

  try {
    for (const item of items) {
      await markSyncItemProcessing(item.id);
      await markEntitySyncStatus(item, "syncing");
    }

    if (items.length > 0) {
      const deviceId = await getOrCreateDeviceId();
      const pushResult = await pushSyncOperations({ deviceId, operations: items });

      for (const accepted of pushResult.accepted) {
        resolvedItemIds.add(accepted.operationId);
        await markSyncItemDone(accepted.operationId);
        const item = items.find((candidate) => candidate.id === accepted.operationId);
        if (item) {
          await markEntitySyncStatus(item, "synced", pushResult.serverTime);
        }
      }

      for (const failed of pushResult.failed) {
        resolvedItemIds.add(failed.operationId);
        await markSyncItemFailed(failed.operationId, failed.message);
        const item = items.find((candidate) => candidate.id === failed.operationId);
        if (item) {
          await markEntitySyncStatus(item, "failed");
        }
      }

      for (const conflict of pushResult.conflicts) {
        resolvedItemIds.add(conflict.operationId);
        await markSyncItemFailed(conflict.operationId, "Conflict reported by server");
        const item = items.find((candidate) => candidate.id === conflict.operationId);
        if (item) {
          await markEntityConflict(item);
        }
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

    for (const remoteFixedExpense of pullResult.fixedExpenses ?? []) {
      const hasLocalPending = await hasPendingSyncForEntity(remoteFixedExpense.id);
      if (hasLocalPending) {
        await markFixedExpenseConflict(remoteFixedExpense.id);
      } else {
        await mergeRemoteFixedExpense(remoteFixedExpense);
      }
    }

    for (const remoteOccurrence of pullResult.fixedExpenseOccurrences ?? []) {
      const hasLocalPending = await hasPendingSyncForEntity(remoteOccurrence.id);
      if (hasLocalPending) {
        await markFixedExpenseOccurrenceConflict(remoteOccurrence.id);
      } else {
        await mergeRemoteFixedExpenseOccurrence(remoteOccurrence);
      }
    }

    await setLastPulledAt(pullResult.serverTime);
    // Purge resolved items so failedSyncCount drops after a successful full sync.
    await clearDoneItems();
    await Promise.all([
      useTransactionStore.getState().refreshTransactions(),
      useFixedExpenseStore.getState().refreshAll(),
    ]);

    return { processed: items.length };
  } catch (error) {
    // Only mark items that were not already resolved by the push step.
    const unresolvedItems = items.filter((item) => !resolvedItemIds.has(item.id));
    for (const item of unresolvedItems) {
      await markEntitySyncStatus(item, "failed");
      await markSyncItemFailed(item.id, error);
    }
    await Promise.all([
      useTransactionStore.getState().refreshTransactions(),
      useFixedExpenseStore.getState().refreshAll(),
    ]);
    return { processed: resolvedItemIds.size };
  } finally {
    isSyncing = false;
    useTransactionStore.getState().setIsSyncing(false);
  }
}

export async function processSyncItem(item: SyncQueueItem) {
  return syncPendingItems();
}

async function markEntitySyncStatus(item: SyncQueueItem, status: "synced" | "syncing" | "failed", serverUpdatedAt?: string) {
  if (item.entity === "fixed_expense") {
    await markFixedExpenseSyncStatus(item.entityId, status, serverUpdatedAt);
    return;
  }

  if (item.entity === "fixed_expense_occurrence") {
    await markFixedExpenseOccurrenceSyncStatus(item.entityId, status, serverUpdatedAt);
    return;
  }

  await markTransactionSyncStatus(item.entityId, status, serverUpdatedAt);
}

async function markEntityConflict(item: SyncQueueItem) {
  if (item.entity === "fixed_expense") {
    await markFixedExpenseConflict(item.entityId);
    return;
  }

  if (item.entity === "fixed_expense_occurrence") {
    await markFixedExpenseOccurrenceConflict(item.entityId);
    return;
  }

  await markTransactionConflict(item.entityId);
}

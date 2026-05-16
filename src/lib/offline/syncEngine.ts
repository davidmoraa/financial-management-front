import { getPendingSyncItems, markSyncItemDone, markSyncItemFailed, markSyncItemProcessing } from "@/lib/offline/syncQueueRepository";
import { markTransactionSyncStatus } from "@/lib/offline/transactionRepository";
import type { SyncQueueItem } from "@/types/finance";

let isSyncing = false;

export function canSync() {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

export async function syncPendingItems() {
  if (isSyncing || !canSync()) {
    return { processed: 0 };
  }

  isSyncing = true;
  let processed = 0;

  try {
    const items = await getPendingSyncItems();

    for (const item of items) {
      try {
        await markSyncItemProcessing(item.id);
        await processSyncItem(item);
        await markSyncItemDone(item.id);
        processed += 1;
      } catch (error) {
        if (item.entity === "transaction") {
          await markTransactionSyncStatus(item.entityId, "failed");
        }
        await markSyncItemFailed(item.id, error);
      }
    }

    return { processed };
  } finally {
    isSyncing = false;
  }
}

export async function processSyncItem(item: SyncQueueItem) {
  if (!canSync()) {
    throw new Error("No network connection available");
  }

  if (item.entity !== "transaction") {
    throw new Error(`Unsupported sync entity: ${item.entity}`);
  }

  await markTransactionSyncStatus(item.entityId, "syncing");

  // Placeholder for the next phase:
  // - create/update/delete will call Supabase or an API endpoint here
  // - local data stays intact even when remote sync fails
  // - serverUpdatedAt should be replaced with the remote timestamp
  await markTransactionSyncStatus(item.entityId, "synced", new Date().toISOString());
}

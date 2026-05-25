import { financeDb } from "@/lib/offline/db";
import type { SyncQueueEntity, SyncQueueItem, SyncQueueOperation, SyncQueueStatus } from "@/types/finance";

type EnqueueSyncItemInput = {
  entity: SyncQueueEntity;
  entityId: string;
  operation: SyncQueueOperation;
  payload: unknown;
};

let lastTimestampMs = 0;

const nowIso = () => {
  const timestampMs = Math.max(Date.now(), lastTimestampMs + 1);
  lastTimestampMs = timestampMs;
  return new Date(timestampMs).toISOString();
};

export async function getPendingSyncItems() {
  return financeDb.syncQueue
    .where("status")
    .anyOf(["pending", "failed", "processing"])
    .sortBy("createdAt");
}

export async function enqueueSyncItem(input: EnqueueSyncItemInput) {
  const timestamp = nowIso();
  const item: SyncQueueItem = {
    id: crypto.randomUUID(),
    entity: input.entity,
    entityId: input.entityId,
    operation: input.operation,
    payload: input.payload,
    status: "pending",
    attempts: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await financeDb.syncQueue.add(item);
  return item;
}

export async function markSyncItemProcessing(id: string) {
  await updateSyncItemStatus(id, "processing");
}

export async function markSyncItemDone(id: string) {
  await updateSyncItemStatus(id, "done");
}

export async function markSyncItemFailed(id: string, error: unknown) {
  const item = await financeDb.syncQueue.get(id);
  await financeDb.syncQueue.update(id, {
    status: "failed",
    attempts: (item?.attempts ?? 0) + 1,
    lastError: error instanceof Error ? error.message : String(error),
    updatedAt: nowIso(),
  });
}

export async function clearDoneItems() {
  await financeDb.syncQueue.where("status").equals("done").delete();
}

export async function getPendingCount() {
  return financeDb.syncQueue.where("status").anyOf(["pending", "processing"]).count();
}

export async function getFailedCount() {
  return financeDb.syncQueue.where("status").equals("failed").count();
}

export async function hasPendingSyncForEntity(entityId: string) {
  const count = await financeDb.syncQueue
    .where("entityId")
    .equals(entityId)
    .filter((item) => item.status === "pending" || item.status === "processing" || item.status === "failed")
    .count();
  return count > 0;
}

async function updateSyncItemStatus(id: string, status: SyncQueueStatus) {
  await financeDb.syncQueue.update(id, {
    status,
    updatedAt: nowIso(),
    ...(status !== "failed" ? { lastError: undefined } : {}),
  });
}

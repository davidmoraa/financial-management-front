import { apiClient } from "@/lib/api/client";
import type { SyncQueueItem, Transaction } from "@/types/finance";

export type RemoteTransaction = Omit<Transaction, "syncStatus">;

export type PushSyncResponse = {
  serverTime: string;
  accepted: Array<{ operationId: string; entityId: string }>;
  failed: Array<{ operationId: string; entityId: string; code: string; message: string }>;
  conflicts: Array<{ operationId: string; entityId: string }>;
};

export type PullSyncResponse = {
  serverTime: string;
  transactions: RemoteTransaction[];
};

export function pushSyncOperations(input: { deviceId: string; operations: SyncQueueItem[] }) {
  return apiClient.post<PushSyncResponse>("/v1/sync/push", {
    deviceId: input.deviceId,
    operations: input.operations.map((item) => ({
      id: item.id,
      entity: item.entity,
      entityId: item.entityId,
      operation: item.operation,
      payload: item.payload,
    })),
  });
}

export function pullRemoteChanges(since?: string) {
  const query = since ? `?since=${encodeURIComponent(since)}` : "";
  return apiClient.get<PullSyncResponse>(`/v1/sync/pull${query}`);
}

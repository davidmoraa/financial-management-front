import { describe, expect, it } from "vitest";
import {
  enqueueSyncItem,
  getPendingSyncItems,
  markSyncItemDone,
  markSyncItemProcessing,
} from "@/lib/offline/syncQueueRepository";

describe("syncQueueRepository", () => {
  it("getPendingSyncItems devuelve pendientes", async () => {
    const item = await enqueueSyncItem({
      entity: "transaction",
      entityId: "tx-1",
      operation: "create",
      payload: { id: "tx-1" },
    });
    await markSyncItemDone(item.id);

    await enqueueSyncItem({
      entity: "transaction",
      entityId: "tx-2",
      operation: "update",
      payload: { id: "tx-2" },
    });

    const pendingItems = await getPendingSyncItems();

    expect(pendingItems).toHaveLength(1);
    expect(pendingItems[0].entityId).toBe("tx-2");
  });

  it("getPendingSyncItems vuelve a tomar items que quedaron en processing", async () => {
    const item = await enqueueSyncItem({
      entity: "transaction",
      entityId: "tx-processing",
      operation: "create",
      payload: { id: "tx-processing" },
    });
    await markSyncItemProcessing(item.id);

    const pendingItems = await getPendingSyncItems();

    expect(pendingItems).toHaveLength(1);
    expect(pendingItems[0]).toMatchObject({ entityId: "tx-processing", status: "processing" });
  });
});

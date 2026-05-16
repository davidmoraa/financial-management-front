import { describe, expect, it, vi } from "vitest";
import { createTransaction, getTransactionById } from "@/lib/offline/transactionRepository";
import { getPendingSyncItems } from "@/lib/offline/syncQueueRepository";
import { syncPendingItems } from "@/lib/offline/syncEngine";
import { useAuthStore } from "@/stores/authStore";

vi.mock("@/lib/remote/syncApi", () => ({
  pushSyncOperations: vi.fn(async ({ operations }) => ({
    serverTime: "2026-05-16T10:00:00.000Z",
    accepted: operations.map((item: { id: string; entityId: string }) => ({ operationId: item.id, entityId: item.entityId })),
    failed: [],
    conflicts: [],
  })),
  pullRemoteChanges: vi.fn(async () => ({
    serverTime: "2026-05-16T10:00:01.000Z",
    transactions: [],
  })),
}));

describe("syncEngine", () => {
  it("envía pending items a la API y marca transacción como synced", async () => {
    useAuthStore.setState({ token: "token", isAuthenticated: true, user: { id: "u1", email: "a@test.com" } });
    const transaction = await createTransaction({
      type: "expense",
      amount: 50,
      categoryId: "food",
      categoryName: "Comida",
      paymentMethod: "cash",
      transactionDate: "2026-05-16",
    });

    await syncPendingItems();

    const stored = await getTransactionById(transaction.id);
    const pending = await getPendingSyncItems();

    expect(stored?.syncStatus).toBe("synced");
    expect(pending).toHaveLength(0);
  });
});

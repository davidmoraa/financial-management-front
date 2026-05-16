import { describe, expect, it } from "vitest";
import { financeDb } from "@/lib/offline/db";
import {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  softDeleteTransaction,
  updateTransaction,
  type TransactionMutationInput,
} from "@/lib/offline/transactionRepository";
import { getPendingSyncItems } from "@/lib/offline/syncQueueRepository";

const baseInput: TransactionMutationInput = {
  type: "expense",
  amount: 125,
  categoryId: "food",
  categoryName: "Comida",
  paymentMethod: "debit_card",
  transactionDate: "2026-05-16",
  note: "Café",
};

describe("transactionRepository", () => {
  it("createTransaction guarda en IndexedDB", async () => {
    const transaction = await createTransaction(baseInput);

    const stored = await getTransactionById(transaction.id);

    expect(stored).toMatchObject({
      id: transaction.id,
      amount: 125,
      syncStatus: "pending",
    });
  });

  it("createTransaction agrega operación create a syncQueue", async () => {
    const transaction = await createTransaction(baseInput);

    const pendingItems = await getPendingSyncItems();

    expect(pendingItems).toHaveLength(1);
    expect(pendingItems[0]).toMatchObject({
      entity: "transaction",
      entityId: transaction.id,
      operation: "create",
      status: "pending",
    });
  });

  it("updateTransaction agrega operación update", async () => {
    const transaction = await createTransaction(baseInput);

    await updateTransaction(transaction.id, {
      ...baseInput,
      amount: 240,
      note: "Comida",
    });

    const pendingItems = await getPendingSyncItems();

    expect(pendingItems.map((item) => item.operation)).toEqual(["create", "update"]);
  });

  it("softDeleteTransaction no borra físicamente el movimiento", async () => {
    const transaction = await createTransaction(baseInput);

    await softDeleteTransaction(transaction.id);

    const stored = await financeDb.transactions.get(transaction.id);
    const visibleTransactions = await getAllTransactions();
    const pendingItems = await getPendingSyncItems();

    expect(stored?.deletedAt).toEqual(expect.any(String));
    expect(visibleTransactions).toHaveLength(0);
    expect(pendingItems.map((item) => item.operation)).toEqual(["create", "delete"]);
  });
});

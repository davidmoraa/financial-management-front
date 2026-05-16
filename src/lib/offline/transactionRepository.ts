import { isSameMonth, parseISO } from "date-fns";
import { financeDb } from "@/lib/offline/db";
import { enqueueSyncItem } from "@/lib/offline/syncQueueRepository";
import type { PaymentMethod, Transaction, TransactionType } from "@/types/finance";

export type TransactionMutationInput = {
  type: TransactionType;
  amount: number;
  categoryId: string;
  categoryName: string;
  paymentMethod: PaymentMethod;
  transactionDate: string;
  note?: string;
};

const nowIso = () => new Date().toISOString();

export async function getAllTransactions() {
  return financeDb.transactions
    .filter((transaction) => !transaction.deletedAt)
    .toArray()
    .then(sortTransactionsDesc);
}

export async function getTransactionById(id: string) {
  return financeDb.transactions.get(id);
}

export async function createTransaction(input: TransactionMutationInput) {
  const timestamp = nowIso();
  const transaction: Transaction = {
    id: crypto.randomUUID(),
    type: input.type,
    amount: input.amount,
    categoryId: input.categoryId,
    categoryName: input.categoryName,
    paymentMethod: input.paymentMethod,
    transactionDate: input.transactionDate,
    note: input.note?.trim() || undefined,
    syncStatus: "pending",
    clientCreatedAt: timestamp,
    clientUpdatedAt: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await financeDb.transaction("rw", financeDb.transactions, financeDb.syncQueue, async () => {
    await financeDb.transactions.add(transaction);
    await enqueueSyncItem({
      entity: "transaction",
      entityId: transaction.id,
      operation: "create",
      payload: transaction,
    });
  });

  return transaction;
}

export async function updateTransaction(id: string, input: TransactionMutationInput) {
  const current = await financeDb.transactions.get(id);
  if (!current) {
    throw new Error("Transaction not found");
  }

  const timestamp = nowIso();
  const updatedTransaction: Transaction = {
    ...current,
    type: input.type,
    amount: input.amount,
    categoryId: input.categoryId,
    categoryName: input.categoryName,
    paymentMethod: input.paymentMethod,
    transactionDate: input.transactionDate,
    note: input.note?.trim() || undefined,
    syncStatus: "pending",
    clientUpdatedAt: timestamp,
    updatedAt: timestamp,
  };

  await financeDb.transaction("rw", financeDb.transactions, financeDb.syncQueue, async () => {
    await financeDb.transactions.put(updatedTransaction);
    await enqueueSyncItem({
      entity: "transaction",
      entityId: id,
      operation: "update",
      payload: updatedTransaction,
    });
  });

  return updatedTransaction;
}

export async function softDeleteTransaction(id: string) {
  const current = await financeDb.transactions.get(id);
  if (!current) {
    throw new Error("Transaction not found");
  }

  const timestamp = nowIso();
  const deletedTransaction: Transaction = {
    ...current,
    syncStatus: "pending",
    deletedAt: timestamp,
    clientUpdatedAt: timestamp,
    updatedAt: timestamp,
  };

  await financeDb.transaction("rw", financeDb.transactions, financeDb.syncQueue, async () => {
    await financeDb.transactions.put(deletedTransaction);
    await enqueueSyncItem({
      entity: "transaction",
      entityId: id,
      operation: "delete",
      payload: { id, deletedAt: timestamp },
    });
  });

  return deletedTransaction;
}

export async function getTransactionsByMonth(date: Date) {
  const transactions = await getAllTransactions();
  return transactions.filter((transaction) => isSameMonth(parseISO(transaction.transactionDate), date));
}

export async function getRecentTransactions(limit = 5) {
  const transactions = await getAllTransactions();
  return transactions.slice(0, limit);
}

export async function markTransactionSyncStatus(id: string, syncStatus: Transaction["syncStatus"], serverUpdatedAt?: string) {
  const timestamp = nowIso();
  await financeDb.transactions.update(id, {
    syncStatus,
    serverUpdatedAt,
    updatedAt: timestamp,
  });
}

export async function mergeRemoteTransaction(remote: Omit<Transaction, "syncStatus">) {
  const local: Transaction = {
    ...remote,
    syncStatus: "synced",
  };
  await financeDb.transactions.put(local);
  return local;
}

export async function markTransactionConflict(id: string) {
  await markTransactionSyncStatus(id, "conflict");
}

function sortTransactionsDesc(transactions: Transaction[]) {
  return transactions.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
}

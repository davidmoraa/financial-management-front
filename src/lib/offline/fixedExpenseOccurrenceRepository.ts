import { startOfMonth } from "date-fns";
import { financeDb } from "@/lib/offline/db";
import { enqueueSyncItem } from "@/lib/offline/syncQueueRepository";
import type { PaymentMethod, Transaction } from "@/types/finance";
import type { FixedExpenseOccurrence } from "@/types/fixedExpenses";

export type MarkFixedExpensePaidInput = {
  fixedExpenseId: string;
  occurrenceMonth: string;
  amount?: number;
  transactionDate: string;
  paymentMethod?: PaymentMethod;
  note?: string;
};

export type SkipFixedExpenseInput = {
  fixedExpenseId: string;
  occurrenceMonth: string;
  note?: string;
};

const nowIso = () => new Date().toISOString();

export async function getOccurrencesByMonth(targetMonth: Date) {
  const month = monthStartIso(targetMonth);
  return financeDb.fixedExpenseOccurrences
    .where("occurrenceMonth")
    .equals(month)
    .filter((occurrence) => !occurrence.deletedAt)
    .toArray();
}

export async function getOccurrenceForFixedExpenseMonth(fixedExpenseId: string, targetMonth: Date | string) {
  const month = typeof targetMonth === "string" ? targetMonth : monthStartIso(targetMonth);
  return financeDb.fixedExpenseOccurrences
    .where("fixedExpenseId")
    .equals(fixedExpenseId)
    .filter((occurrence) => occurrence.occurrenceMonth === month && !occurrence.deletedAt)
    .first();
}

export async function markFixedExpensePaid(input: MarkFixedExpensePaidInput) {
  const fixedExpense = await financeDb.fixedExpenses.get(input.fixedExpenseId);
  if (!fixedExpense || fixedExpense.deletedAt) {
    throw new Error("Fixed expense not found");
  }

  const currentOccurrence = await getOccurrenceForFixedExpenseMonth(input.fixedExpenseId, input.occurrenceMonth);
  const timestamp = nowIso();
  const occurrenceId = currentOccurrence?.id ?? crypto.randomUUID();
  const transactionId = currentOccurrence?.transactionId ?? crypto.randomUUID();
  const transactionOperation = currentOccurrence?.transactionId ? "update" : "create";
  const occurrenceOperation = currentOccurrence ? "update" : "create";

  const transaction: Transaction = {
    id: transactionId,
    type: "expense",
    amount: input.amount ?? fixedExpense.amount,
    categoryId: fixedExpense.categoryId,
    categoryName: fixedExpense.categoryName,
    paymentMethod: input.paymentMethod ?? fixedExpense.paymentMethod ?? "other",
    transactionDate: input.transactionDate,
    note: input.note?.trim() || fixedExpense.note,
    fixedExpenseId: fixedExpense.id,
    fixedExpenseOccurrenceId: occurrenceId,
    syncStatus: "pending",
    clientCreatedAt: currentOccurrence?.clientCreatedAt ?? timestamp,
    clientUpdatedAt: timestamp,
    createdAt: currentOccurrence?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };

  const occurrence: FixedExpenseOccurrence = {
    id: occurrenceId,
    fixedExpenseId: fixedExpense.id,
    occurrenceMonth: input.occurrenceMonth,
    status: "paid",
    transactionId,
    paidAt: timestamp,
    skippedAt: undefined,
    note: input.note?.trim() || undefined,
    syncStatus: "pending",
    clientCreatedAt: currentOccurrence?.clientCreatedAt ?? timestamp,
    clientUpdatedAt: timestamp,
    createdAt: currentOccurrence?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };

  await financeDb.transaction(
    "rw",
    financeDb.transactions,
    financeDb.fixedExpenseOccurrences,
    financeDb.syncQueue,
    async () => {
      await financeDb.transactions.put(transaction);
      await financeDb.fixedExpenseOccurrences.put(occurrence);
      await enqueueSyncItem({
        entity: "transaction",
        entityId: transaction.id,
        operation: transactionOperation,
        payload: transaction,
      });
      await enqueueSyncItem({
        entity: "fixed_expense_occurrence",
        entityId: occurrence.id,
        operation: occurrenceOperation,
        payload: occurrence,
      });
    },
  );

  return { occurrence, transaction };
}

export async function skipFixedExpenseForMonth(input: SkipFixedExpenseInput) {
  const fixedExpense = await financeDb.fixedExpenses.get(input.fixedExpenseId);
  if (!fixedExpense || fixedExpense.deletedAt) {
    throw new Error("Fixed expense not found");
  }

  const currentOccurrence = await getOccurrenceForFixedExpenseMonth(input.fixedExpenseId, input.occurrenceMonth);
  const timestamp = nowIso();
  const occurrence: FixedExpenseOccurrence = {
    id: currentOccurrence?.id ?? crypto.randomUUID(),
    fixedExpenseId: fixedExpense.id,
    occurrenceMonth: input.occurrenceMonth,
    status: "skipped",
    transactionId: undefined,
    paidAt: undefined,
    skippedAt: timestamp,
    note: input.note?.trim() || undefined,
    syncStatus: "pending",
    clientCreatedAt: currentOccurrence?.clientCreatedAt ?? timestamp,
    clientUpdatedAt: timestamp,
    createdAt: currentOccurrence?.createdAt ?? timestamp,
    updatedAt: timestamp,
  };

  await financeDb.transaction("rw", financeDb.fixedExpenseOccurrences, financeDb.syncQueue, async () => {
    await financeDb.fixedExpenseOccurrences.put(occurrence);
    await enqueueSyncItem({
      entity: "fixed_expense_occurrence",
      entityId: occurrence.id,
      operation: currentOccurrence ? "update" : "create",
      payload: occurrence,
    });
  });

  return occurrence;
}

export async function softDeleteOccurrence(id: string) {
  const current = await financeDb.fixedExpenseOccurrences.get(id);
  if (!current) {
    throw new Error("Fixed expense occurrence not found");
  }

  const timestamp = nowIso();
  const occurrence: FixedExpenseOccurrence = {
    ...current,
    syncStatus: "pending",
    deletedAt: timestamp,
    clientUpdatedAt: timestamp,
    updatedAt: timestamp,
  };

  await financeDb.transaction("rw", financeDb.fixedExpenseOccurrences, financeDb.syncQueue, async () => {
    await financeDb.fixedExpenseOccurrences.put(occurrence);
    await enqueueSyncItem({
      entity: "fixed_expense_occurrence",
      entityId: id,
      operation: "delete",
      payload: { id, deletedAt: timestamp },
    });
  });

  return occurrence;
}

export async function markFixedExpenseOccurrenceSyncStatus(
  id: string,
  syncStatus: FixedExpenseOccurrence["syncStatus"],
  serverUpdatedAt?: string,
) {
  await financeDb.fixedExpenseOccurrences.update(id, {
    syncStatus,
    serverUpdatedAt,
    updatedAt: nowIso(),
  });
}

export async function markFixedExpenseOccurrenceConflict(id: string) {
  await markFixedExpenseOccurrenceSyncStatus(id, "conflict");
}

export async function mergeRemoteFixedExpenseOccurrence(remote: Omit<FixedExpenseOccurrence, "syncStatus">) {
  const occurrence: FixedExpenseOccurrence = {
    ...remote,
    syncStatus: "synced",
  };
  await financeDb.fixedExpenseOccurrences.put(occurrence);
  return occurrence;
}

export function monthStartIso(date: Date) {
  return startOfMonth(date).toISOString().slice(0, 10);
}

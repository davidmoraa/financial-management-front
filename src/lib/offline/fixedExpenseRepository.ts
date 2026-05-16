import { isSameMonth, parseISO, startOfMonth } from "date-fns";
import { financeDb } from "@/lib/offline/db";
import { enqueueSyncItem } from "@/lib/offline/syncQueueRepository";
import type { PaymentMethod } from "@/types/finance";
import type { FixedExpense } from "@/types/fixedExpenses";

export type FixedExpenseMutationInput = {
  id?: string;
  name: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  paymentMethod?: PaymentMethod;
  paymentWindowStartDay: number;
  paymentWindowEndDay: number;
  activeFromMonth: string;
  activeUntilMonth?: string;
  includeInForecast: boolean;
  isActive?: boolean;
  note?: string;
};

const nowIso = () => new Date().toISOString();

export async function getAllFixedExpenses() {
  return financeDb.fixedExpenses
    .filter((fixedExpense) => !fixedExpense.deletedAt)
    .toArray()
    .then(sortFixedExpenses);
}

export async function getActiveFixedExpensesForMonth(targetMonth: Date) {
  const fixedExpenses = await getAllFixedExpenses();
  return fixedExpenses.filter((fixedExpense) => isFixedExpenseActiveForMonth(fixedExpense, targetMonth));
}

export async function getFixedExpenseById(id: string) {
  return financeDb.fixedExpenses.get(id);
}

export async function createFixedExpense(input: FixedExpenseMutationInput) {
  const timestamp = nowIso();
  const fixedExpense: FixedExpense = {
    id: input.id ?? crypto.randomUUID(),
    name: input.name.trim(),
    amount: input.amount,
    categoryId: input.categoryId,
    categoryName: input.categoryName,
    paymentMethod: input.paymentMethod,
    recurrence: "monthly",
    paymentWindowStartDay: input.paymentWindowStartDay,
    paymentWindowEndDay: input.paymentWindowEndDay,
    activeFromMonth: input.activeFromMonth,
    activeUntilMonth: input.activeUntilMonth || undefined,
    includeInForecast: input.includeInForecast,
    isActive: input.isActive ?? true,
    note: input.note?.trim() || undefined,
    syncStatus: "pending",
    clientCreatedAt: timestamp,
    clientUpdatedAt: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await financeDb.transaction("rw", financeDb.fixedExpenses, financeDb.syncQueue, async () => {
    await financeDb.fixedExpenses.add(fixedExpense);
    await enqueueSyncItem({
      entity: "fixed_expense",
      entityId: fixedExpense.id,
      operation: "create",
      payload: fixedExpense,
    });
  });

  return fixedExpense;
}

export async function updateFixedExpense(id: string, input: FixedExpenseMutationInput) {
  const current = await financeDb.fixedExpenses.get(id);
  if (!current) {
    throw new Error("Fixed expense not found");
  }

  const timestamp = nowIso();
  const fixedExpense: FixedExpense = {
    ...current,
    name: input.name.trim(),
    amount: input.amount,
    categoryId: input.categoryId,
    categoryName: input.categoryName,
    paymentMethod: input.paymentMethod,
    paymentWindowStartDay: input.paymentWindowStartDay,
    paymentWindowEndDay: input.paymentWindowEndDay,
    activeFromMonth: input.activeFromMonth,
    activeUntilMonth: input.activeUntilMonth || undefined,
    includeInForecast: input.includeInForecast,
    isActive: input.isActive ?? current.isActive,
    note: input.note?.trim() || undefined,
    syncStatus: "pending",
    clientUpdatedAt: timestamp,
    updatedAt: timestamp,
  };

  await financeDb.transaction("rw", financeDb.fixedExpenses, financeDb.syncQueue, async () => {
    await financeDb.fixedExpenses.put(fixedExpense);
    await enqueueSyncItem({
      entity: "fixed_expense",
      entityId: id,
      operation: "update",
      payload: fixedExpense,
    });
  });

  return fixedExpense;
}

export async function softDeleteFixedExpense(id: string) {
  const current = await financeDb.fixedExpenses.get(id);
  if (!current) {
    throw new Error("Fixed expense not found");
  }

  const timestamp = nowIso();
  const fixedExpense: FixedExpense = {
    ...current,
    isActive: false,
    syncStatus: "pending",
    deletedAt: timestamp,
    clientUpdatedAt: timestamp,
    updatedAt: timestamp,
  };

  await financeDb.transaction("rw", financeDb.fixedExpenses, financeDb.syncQueue, async () => {
    await financeDb.fixedExpenses.put(fixedExpense);
    await enqueueSyncItem({
      entity: "fixed_expense",
      entityId: id,
      operation: "delete",
      payload: { id, deletedAt: timestamp },
    });
  });

  return fixedExpense;
}

export async function markFixedExpenseSyncStatus(id: string, syncStatus: FixedExpense["syncStatus"], serverUpdatedAt?: string) {
  await financeDb.fixedExpenses.update(id, {
    syncStatus,
    serverUpdatedAt,
    updatedAt: nowIso(),
  });
}

export async function markFixedExpenseConflict(id: string) {
  await markFixedExpenseSyncStatus(id, "conflict");
}

export async function mergeRemoteFixedExpense(remote: Omit<FixedExpense, "syncStatus">) {
  const fixedExpense: FixedExpense = {
    ...remote,
    syncStatus: "synced",
  };
  await financeDb.fixedExpenses.put(fixedExpense);
  return fixedExpense;
}

function isFixedExpenseActiveForMonth(fixedExpense: FixedExpense, targetMonth: Date) {
  if (fixedExpense.deletedAt || !fixedExpense.isActive) {
    return false;
  }

  const target = startOfMonth(targetMonth);
  const activeFrom = startOfMonth(parseISO(fixedExpense.activeFromMonth));
  const activeUntil = fixedExpense.activeUntilMonth ? startOfMonth(parseISO(fixedExpense.activeUntilMonth)) : null;

  return target >= activeFrom && (!activeUntil || target <= activeUntil || isSameMonth(target, activeUntil));
}

function sortFixedExpenses(fixedExpenses: FixedExpense[]) {
  return fixedExpenses.sort((a, b) => a.paymentWindowStartDay - b.paymentWindowStartDay || a.name.localeCompare(b.name));
}

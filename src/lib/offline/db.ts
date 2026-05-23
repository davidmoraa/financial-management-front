import Dexie, { type Table } from "dexie";
import type { Category, SyncQueueItem, Transaction } from "@/types/finance";
import type { FixedExpense, FixedExpenseOccurrence } from "@/types/fixedExpenses";
import type { CreditCard } from "@/types/creditCards";

export type FinanceSettingKey =
  | "monthlyBudget"
  | "expectedIncomeAmount"
  | "incomeCadence"
  | "expectedMonthlyIncome"
  | "currency"
  | "initialSeedComplete"
  | "deviceId"
  | "lastPulledAt"
  | "currentUserId";

export type FinanceSetting = {
  key: FinanceSettingKey;
  value: unknown;
  updatedAt: string;
};

export class FinanceDatabase extends Dexie {
  transactions!: Table<Transaction, string>;
  fixedExpenses!: Table<FixedExpense, string>;
  fixedExpenseOccurrences!: Table<FixedExpenseOccurrence, string>;
  creditCards!: Table<CreditCard, string>;
  categories!: Table<Category, string>;
  settings!: Table<FinanceSetting, FinanceSettingKey>;
  syncQueue!: Table<SyncQueueItem, string>;

  constructor() {
    super("financial-management-offline-db");

    this.version(1).stores({
      transactions: "&id, type, categoryId, transactionDate, syncStatus, deletedAt, updatedAt",
      categories: "&id, type, name",
      settings: "&key",
      syncQueue: "&id, entity, entityId, operation, status, createdAt, updatedAt",
    });

    this.version(2).stores({
      transactions: "&id, type, categoryId, transactionDate, fixedExpenseId, fixedExpenseOccurrenceId, syncStatus, deletedAt, updatedAt",
      fixedExpenses: "&id, name, categoryId, isActive, syncStatus, deletedAt, updatedAt",
      fixedExpenseOccurrences: "&id, fixedExpenseId, occurrenceMonth, status, transactionId, syncStatus, deletedAt, updatedAt",
      categories: "&id, type, name",
      settings: "&key",
      syncQueue: "&id, entity, entityId, operation, status, createdAt, updatedAt",
    });

    this.version(3).stores({
      transactions: "&id, type, categoryId, transactionDate, fixedExpenseId, fixedExpenseOccurrenceId, creditCardId, syncStatus, deletedAt, updatedAt",
      fixedExpenses: "&id, name, categoryId, isActive, syncStatus, deletedAt, updatedAt",
      fixedExpenseOccurrences: "&id, fixedExpenseId, occurrenceMonth, status, transactionId, syncStatus, deletedAt, updatedAt",
      creditCards: "&id, name, isActive, updatedAt",
      categories: "&id, type, name",
      settings: "&key",
      syncQueue: "&id, entity, entityId, operation, status, createdAt, updatedAt",
    });
  }
}

export const financeDb = new FinanceDatabase();

const nowIso = () => new Date().toISOString();

export async function ensureOfflineDatabaseReady() {
  const timestamp = nowIso();

  await financeDb.transaction("rw", financeDb.settings, async () => {
    const currency = await financeDb.settings.get("currency");
    if (!currency) {
      await financeDb.settings.put({
        key: "currency",
        value: "MXN",
        updatedAt: timestamp,
      });
    }
  });
}

export async function prepareOfflineCacheForUser(userId: string) {
  const current = await financeDb.settings.get("currentUserId");
  if (current?.value === userId) {
    return;
  }

  const timestamp = nowIso();
  await financeDb.transaction(
    "rw",
    [
      financeDb.transactions,
      financeDb.fixedExpenses,
      financeDb.fixedExpenseOccurrences,
      financeDb.creditCards,
      financeDb.categories,
      financeDb.syncQueue,
      financeDb.settings,
    ],
    async () => {
      if (typeof current?.value === "string" && current.value !== userId) {
        await Promise.all([
          financeDb.transactions.clear(),
          financeDb.fixedExpenses.clear(),
          financeDb.fixedExpenseOccurrences.clear(),
          financeDb.creditCards.clear(),
          financeDb.categories.clear(),
          financeDb.syncQueue.clear(),
          financeDb.settings.delete("lastPulledAt"),
          financeDb.settings.delete("monthlyBudget"),
          financeDb.settings.delete("expectedIncomeAmount"),
          financeDb.settings.delete("expectedMonthlyIncome"),
          financeDb.settings.delete("incomeCadence"),
        ]);
      }

      await financeDb.settings.put({
        key: "currentUserId",
        value: userId,
        updatedAt: timestamp,
      });
    },
  );
}

export async function clearLocalFinancialRecords() {
  await financeDb.transaction(
    "rw",
    [
      financeDb.transactions,
      financeDb.fixedExpenses,
      financeDb.fixedExpenseOccurrences,
      financeDb.creditCards,
      financeDb.syncQueue,
      financeDb.settings,
    ],
    async () => {
      await Promise.all([
        financeDb.transactions.clear(),
        financeDb.fixedExpenses.clear(),
        financeDb.fixedExpenseOccurrences.clear(),
        financeDb.creditCards.clear(),
        financeDb.syncQueue.clear(),
        financeDb.settings.delete("lastPulledAt"),
      ]);
    },
  );
}

export async function getMonthlyBudgetSetting() {
  const setting = await financeDb.settings.get("monthlyBudget");
  return typeof setting?.value === "number" ? setting.value : 0;
}

export async function setMonthlyBudgetSetting(value: number) {
  await financeDb.settings.put({
    key: "monthlyBudget",
    value,
    updatedAt: nowIso(),
  });
}

export async function getExpectedMonthlyIncomeSetting() {
  const setting = await financeDb.settings.get("expectedMonthlyIncome");
  return typeof setting?.value === "number" ? setting.value : 0;
}

export async function setIncomeSettings(input: {
  monthlyBudget: number;
  expectedIncomeAmount: number;
  expectedMonthlyIncome: number;
  incomeCadence: string;
}) {
  const updatedAt = nowIso();
  await financeDb.settings.bulkPut([
    { key: "monthlyBudget", value: input.monthlyBudget, updatedAt },
    { key: "expectedIncomeAmount", value: input.expectedIncomeAmount, updatedAt },
    { key: "expectedMonthlyIncome", value: input.expectedMonthlyIncome, updatedAt },
    { key: "incomeCadence", value: input.incomeCadence, updatedAt },
  ]);
}

export async function getOrCreateDeviceId() {
  const setting = await financeDb.settings.get("deviceId");
  if (typeof setting?.value === "string") {
    return setting.value;
  }

  const deviceId = crypto.randomUUID();
  await financeDb.settings.put({
    key: "deviceId",
    value: deviceId,
    updatedAt: nowIso(),
  });
  return deviceId;
}

export async function getLastPulledAt() {
  const setting = await financeDb.settings.get("lastPulledAt");
  return typeof setting?.value === "string" ? setting.value : undefined;
}

export async function setLastPulledAt(value: string) {
  await financeDb.settings.put({
    key: "lastPulledAt",
    value,
    updatedAt: nowIso(),
  });
}

export async function resetOfflineDatabaseForTests() {
  await financeDb.delete();
  await financeDb.open();
}

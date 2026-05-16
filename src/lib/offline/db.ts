import Dexie, { type Table } from "dexie";
import type { Category, SyncQueueItem, Transaction } from "@/types/finance";
import { initialCategories } from "@/stores/categoryStore";

export type FinanceSettingKey = "monthlyBudget" | "currency" | "initialSeedComplete" | "deviceId" | "lastPulledAt";

export type FinanceSetting = {
  key: FinanceSettingKey;
  value: unknown;
  updatedAt: string;
};

export class FinanceDatabase extends Dexie {
  transactions!: Table<Transaction, string>;
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
  }
}

export const financeDb = new FinanceDatabase();

const nowIso = () => new Date().toISOString();

export async function ensureOfflineDatabaseReady() {
  const seedComplete = await financeDb.settings.get("initialSeedComplete");

  if (seedComplete?.value === true) {
    return;
  }

  const timestamp = nowIso();

  await financeDb.transaction("rw", financeDb.categories, financeDb.settings, financeDb.transactions, async () => {
    const categoryCount = await financeDb.categories.count();
    if (categoryCount === 0) {
      await financeDb.categories.bulkPut(initialCategories);
    }

    const budget = await financeDb.settings.get("monthlyBudget");
    if (!budget) {
      await financeDb.settings.put({
        key: "monthlyBudget",
        value: 15000,
        updatedAt: timestamp,
      });
    }

    const currency = await financeDb.settings.get("currency");
    if (!currency) {
      await financeDb.settings.put({
        key: "currency",
        value: "MXN",
        updatedAt: timestamp,
      });
    }

    const transactionCount = await financeDb.transactions.count();
    if (transactionCount === 0) {
      await financeDb.transactions.bulkPut(createInitialTransactions(timestamp));
    }

    await financeDb.settings.put({
      key: "initialSeedComplete",
      value: true,
      updatedAt: timestamp,
    });
  });
}

export async function getMonthlyBudgetSetting() {
  const setting = await financeDb.settings.get("monthlyBudget");
  return typeof setting?.value === "number" ? setting.value : 15000;
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

function createInitialTransactions(timestamp: string): Transaction[] {
  const now = new Date();
  const isoDaysAgo = (days: number) => {
    const date = new Date(now);
    date.setDate(now.getDate() - days);
    return date.toISOString();
  };

  return [
    {
      id: "seed-tx-001",
      type: "income",
      amount: 32000,
      categoryId: "salary",
      categoryName: "Sueldo",
      paymentMethod: "transfer",
      transactionDate: isoDaysAgo(9),
      note: "Nómina mensual",
      syncStatus: "synced",
      clientCreatedAt: isoDaysAgo(9),
      clientUpdatedAt: isoDaysAgo(9),
      serverUpdatedAt: timestamp,
      createdAt: isoDaysAgo(9),
      updatedAt: isoDaysAgo(9),
    },
    {
      id: "seed-tx-002",
      type: "expense",
      amount: 1240,
      categoryId: "food",
      categoryName: "Comida",
      paymentMethod: "debit_card",
      transactionDate: isoDaysAgo(2),
      note: "Super y despensa",
      syncStatus: "synced",
      clientCreatedAt: isoDaysAgo(2),
      clientUpdatedAt: isoDaysAgo(2),
      serverUpdatedAt: timestamp,
      createdAt: isoDaysAgo(2),
      updatedAt: isoDaysAgo(2),
    },
    {
      id: "seed-tx-003",
      type: "expense",
      amount: 680,
      categoryId: "transport",
      categoryName: "Transporte",
      paymentMethod: "credit_card",
      transactionDate: isoDaysAgo(3),
      syncStatus: "synced",
      clientCreatedAt: isoDaysAgo(3),
      clientUpdatedAt: isoDaysAgo(3),
      serverUpdatedAt: timestamp,
      createdAt: isoDaysAgo(3),
      updatedAt: isoDaysAgo(3),
    },
    {
      id: "seed-tx-004",
      type: "income",
      amount: 4200,
      categoryId: "freelance",
      categoryName: "Freelance",
      paymentMethod: "transfer",
      transactionDate: isoDaysAgo(5),
      note: "Proyecto corto",
      syncStatus: "synced",
      clientCreatedAt: isoDaysAgo(5),
      clientUpdatedAt: isoDaysAgo(5),
      serverUpdatedAt: timestamp,
      createdAt: isoDaysAgo(5),
      updatedAt: isoDaysAgo(5),
    },
    {
      id: "seed-tx-005",
      type: "expense",
      amount: 299,
      categoryId: "subscriptions",
      categoryName: "Suscripciones",
      paymentMethod: "credit_card",
      transactionDate: isoDaysAgo(1),
      note: "Música",
      syncStatus: "synced",
      clientCreatedAt: isoDaysAgo(1),
      clientUpdatedAt: isoDaysAgo(1),
      serverUpdatedAt: timestamp,
      createdAt: isoDaysAgo(1),
      updatedAt: isoDaysAgo(1),
    },
  ];
}

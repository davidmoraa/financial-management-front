export type TransactionType = "income" | "expense";
export type IncomeCadence = "monthly" | "biweekly" | "weekly";

export type SyncStatus = "synced" | "pending" | "syncing" | "failed" | "conflict";

export type PaymentMethod =
  | "cash"
  | "debit_card"
  | "credit_card"
  | "transfer"
  | "other";

export type Category = {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
};

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  categoryName: string;
  paymentMethod: PaymentMethod;
  transactionDate: string;
  note?: string;
  fixedExpenseId?: string;
  fixedExpenseOccurrenceId?: string;
  syncStatus: SyncStatus;
  clientCreatedAt: string;
  clientUpdatedAt: string;
  serverUpdatedAt?: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type MonthlySummary = {
  income: number;
  actualIncome: number;
  expectedIncome: number;
  expense: number;
  balance: number;
  budget: number;
  budgetUsedPercentage: number;
};

export type SyncQueueEntity = "transaction" | "fixed_expense" | "fixed_expense_occurrence";

export type SyncQueueOperation = "create" | "update" | "delete";

export type SyncQueueStatus = "pending" | "processing" | "done" | "failed";

export type SyncQueueItem = {
  id: string;
  entity: SyncQueueEntity;
  entityId: string;
  operation: SyncQueueOperation;
  payload: unknown;
  status: SyncQueueStatus;
  attempts: number;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
};

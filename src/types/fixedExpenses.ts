import type { PaymentMethod, SyncStatus } from "@/types/finance";

export type FixedExpenseStatus = "paid" | "skipped";

export type FixedExpense = {
  id: string;
  name: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  paymentMethod?: PaymentMethod;
  recurrence: "monthly";
  paymentWindowStartDay: number;
  paymentWindowEndDay: number;
  activeFromMonth: string;
  activeUntilMonth?: string;
  includeInForecast: boolean;
  isActive: boolean;
  note?: string;
  syncStatus: SyncStatus;
  clientCreatedAt: string;
  clientUpdatedAt: string;
  serverUpdatedAt?: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type FixedExpenseOccurrence = {
  id: string;
  fixedExpenseId: string;
  occurrenceMonth: string;
  status: FixedExpenseStatus;
  transactionId?: string;
  paidAt?: string;
  skippedAt?: string;
  note?: string;
  syncStatus: SyncStatus;
  clientCreatedAt: string;
  clientUpdatedAt: string;
  serverUpdatedAt?: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type FixedExpenseForecastItem = {
  fixedExpense: FixedExpense;
  occurrence?: FixedExpenseOccurrence;
  status: "pending" | "paid" | "skipped";
  dueSoon: boolean;
  overdue: boolean;
};

export type BudgetWarning = {
  id: string;
  type:
    | "fixed_payment_due_soon"
    | "fixed_payment_overdue"
    | "projected_budget_exceeded"
    | "high_fixed_expense_ratio"
    | "low_safe_daily_spend"
    | "budget_after_fixed_negative";
  severity: "info" | "warning" | "danger";
  title: string;
  message: string;
  relatedFixedExpenseId?: string;
};

export type MonthlyForecast = {
  actualIncome: number;
  actualExpenses: number;
  actualFixedExpensesPaid: number;
  actualVariableExpenses: number;
  pendingFixedExpenses: number;
  skippedFixedExpenses: number;
  projectedVariableExpenses: number;
  projectedMonthEndExpenses: number;
  projectedBalance: number;
  safeDailySpend: number;
  budgetUsedPercentage: number;
  remainingAfterPendingFixed: number;
  fixedExpenseItems: FixedExpenseForecastItem[];
  warnings: BudgetWarning[];
};

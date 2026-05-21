import type { TransactionType } from "@/types/finance";

export type DashboardBalanceStatus = "healthy" | "warning" | "risk";
export type DashboardRecommendedActionType =
  | "register_movement"
  | "categorize_movements"
  | "review_category"
  | "reserve_fixed_expense"
  | "adjust_budget";
export type DashboardPriority = "low" | "medium" | "high";
export type DashboardCategoryStatus = "ok" | "warning" | "danger";
export type DashboardPeriodType = "monthly" | "biweekly" | "weekly";

export type DashboardPeriod = {
  type: DashboardPeriodType;
  label: string;
  shortLabel: string;
  startsAt: string;
  endsAt: string;
};

export type DashboardSummary = {
  month: string;
  period?: DashboardPeriod;
  balance: {
    current: number;
    projectedEndOfMonth: number;
    status: DashboardBalanceStatus;
    message: string;
  };
  spendingPower: {
    safeToSpendToday: number;
    recommendedDailySpend: number;
    remainingVariableBudget: number;
  };
  income: {
    expected: number;
    received: number;
    pending: number;
  };
  expenses: {
    spent: number;
    fixedPending: number;
    variableSpent: number;
  };
  budget: {
    monthlyBudget: number;
    used: number;
    usedPercentage: number;
  };
  nextFixedExpense?: {
    id: string;
    name: string;
    amount: number;
    dueDate: string;
    daysLeft: number;
  };
  recommendedAction?: {
    type: DashboardRecommendedActionType;
    title: string;
    description: string;
    ctaLabel: string;
    targetPath: string;
    priority: DashboardPriority;
  };
  categoriesToWatch: Array<{
    categoryId: string;
    name: string;
    spent: number;
    budget: number;
    percentage: number;
    status: DashboardCategoryStatus;
  }>;
  recentMovements: Array<{
    id: string;
    description: string;
    categoryName: string;
    amount: number;
    type: TransactionType;
    date: string;
    note?: string;
  }>;
  habit: {
    currentStreakDays: number;
    registrationCoveragePercentage: number;
    message: string;
  };
};

export type DashboardSummaryResponse = {
  summary: DashboardSummary;
};

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
export type FinancialInsightType =
  | "uncategorized_movements"
  | "upcoming_fixed_expense"
  | "category_overspending"
  | "daily_spending_limit"
  | "no_movements_today"
  | "budget_exceeded"
  | "cashflow_risk"
  | "healthy_month"
  | "saving_opportunity"
  | "credit_card_due_soon"
  | "credit_card_overdue"
  | "saving_goal_at_risk"
  | "saving_goal_on_track"
  | "obligation_pressure"
  | "daily_envelope_impact";
export type FinancialInsightSeverity = "positive" | "info" | "warning" | "danger";

export type DashboardPeriod = {
  type: DashboardPeriodType;
  label: string;
  shortLabel: string;
  startsAt: string;
  endsAt: string;
};

export type FinancialInsight = {
  id: string;
  type: FinancialInsightType;
  severity: FinancialInsightSeverity;
  title: string;
  description: string;
  metricLabel?: string;
  metricValue?: number;
  ctaLabel?: string;
  targetPath?: string;
  priority: number;
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
    protectedForObligations?: number;
    protectedForCreditCards?: number;
    protectedForSavings?: number;
  };
  dailyEnvelope?: {
    date: string;
    startingDailyAllowance: number;
    spentToday: number;
    remainingToday: number;
    isOverDailyAllowance: boolean;
    overspentToday: number;
    nextDaysDailyAllowanceBeforeTodaySpending: number;
    nextDaysDailyAllowanceAfterTodaySpending: number;
    nextDaysDailyAllowanceDelta: number;
    message: string;
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
  upcomingObligations: Array<{
    id: string;
    source: "fixed_expense" | "credit_card_statement" | "saving_milestone";
    name: string;
    amount: number;
    dueDate: string;
    priority: "essential" | "important" | "optional";
    status: "pending" | "due_soon" | "overdue" | "reserved" | "paid";
  }>;
  recommendedAction?: {
    type: DashboardRecommendedActionType;
    title: string;
    description: string;
    ctaLabel: string;
    targetPath: string;
    priority: DashboardPriority;
  };
  insights: FinancialInsight[];
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
    daysToNextMilestone?: number;
    isAtRisk?: boolean;
    milestoneProgressPercentage?: number;
    nextMilestoneDays?: number;
    registrationCoveragePercentage: number;
    message: string;
  };
};

export type DashboardSummaryResponse = {
  summary: DashboardSummary;
};

export type AnalyticsSeverity = "positive" | "info" | "warning" | "danger";
export type AnalyticsBudgetStatus = "healthy" | "warning" | "danger";
export type SpendingPaceStatus = "under_pace" | "on_pace" | "over_pace";

export type AnalyticsSummary = {
  period: string;
  overview: {
    income: number;
    expenses: number;
    netSavings: number;
    projectedEndOfPeriod: number;
    savingsRate: number;
  };
  spendingByCategory: Array<{
    categoryId: string;
    categoryName: string;
    amount: number;
    percentage: number;
  }>;
  categoryBudgetProgress: Array<{
    categoryId: string;
    categoryName: string;
    spent: number;
    budget: number;
    percentage: number;
    status: AnalyticsBudgetStatus;
  }>;
  spendingPace: {
    expectedUsagePercentage: number;
    actualUsagePercentage: number;
    status: SpendingPaceStatus;
    message: string;
  };
  cashflowProjection: Array<{
    date: string;
    projectedBalance: number;
    events: Array<{
      type: "income" | "fixed_expense" | "credit_card" | "saving_goal";
      name: string;
      amount: number;
    }>;
  }>;
  fixedVsVariable: {
    fixedExpenses: number;
    variableExpenses: number;
    savingsGoals: number;
    creditCardObligations: number;
  };
  upcomingObligations: Array<{
    id: string;
    source: "fixed_expense" | "credit_card" | "saving_goal";
    name: string;
    amount: number;
    dueDate: string;
    status: "pending" | "due_soon" | "overdue" | "paid";
  }>;
  dailyHeatmap: Array<{
    date: string;
    amount: number;
    intensity: "low" | "medium" | "high";
  }>;
  monthlyTrend: Array<{
    month: string;
    income: number;
    expenses: number;
    netSavings: number;
  }>;
  moneyLeaks: Array<{
    type: "category_growth" | "frequent_small_expenses" | "recurring_charge";
    title: string;
    description: string;
    estimatedMonthlyImpact: number;
    suggestedAction: string;
  }>;
  savingsMilestones: Array<{
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    progressPercentage: number;
    requiredWeeklyContribution: number;
    health: "on_track" | "needs_attention" | "at_risk" | "completed";
  }>;
  creditCards: Array<{
    id: string;
    name: string;
    currentCycleAmount: number;
    statementClosingDate: string;
    paymentDueDate: string;
    utilizationPercentage?: number;
    status: "ok" | "due_soon" | "over_utilized";
  }>;
  insights: Array<{
    id: string;
    severity: AnalyticsSeverity;
    title: string;
    description: string;
    suggestedAction?: string;
    targetPath?: string;
  }>;
};

export type AnalyticsSummaryResponse = {
  summary: AnalyticsSummary;
};

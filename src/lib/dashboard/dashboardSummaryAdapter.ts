import { format } from "date-fns";
import type { TransactionType } from "@/types/finance";
import type { BudgetWarning, MonthlyForecast } from "@/types/fixedExpenses";
import type { DashboardSummary } from "@/types/dashboard";

export function getDashboardMonthKey(date: Date) {
  return format(date, "yyyy-MM");
}

export function isDashboardSummaryEmpty(summary: DashboardSummary) {
  return (
    (summary.recentMovements ?? []).length === 0 &&
    summary.income.received === 0 &&
    summary.expenses.spent === 0 &&
    summary.expenses.fixedPending === 0
  );
}

export function adaptDashboardSummary(summary: DashboardSummary) {
  const plannedIncome = Math.max(summary.income.expected, summary.income.received);
  const actualFixedExpensesPaid = Math.max(0, summary.expenses.spent - summary.expenses.variableSpent);
  const projectedMonthEndExpenses = Math.max(
    summary.expenses.spent + summary.expenses.fixedPending,
    plannedIncome - summary.balance.projectedEndOfMonth,
  );
  const projectedVariableExpenses = Math.max(0, projectedMonthEndExpenses - actualFixedExpensesPaid - summary.expenses.fixedPending);
  const warnings = buildWarnings(summary);

  const forecast: MonthlyForecast = {
    actualIncome: plannedIncome,
    actualExpenses: summary.expenses.spent,
    actualFixedExpensesPaid,
    actualVariableExpenses: summary.expenses.variableSpent,
    pendingFixedExpenses: summary.expenses.fixedPending,
    skippedFixedExpenses: 0,
    projectedVariableExpenses,
    projectedMonthEndExpenses,
    projectedBalance: summary.balance.projectedEndOfMonth,
    safeDailySpend: summary.spendingPower.safeToSpendToday,
    budgetUsedPercentage: summary.budget.usedPercentage,
    remainingAfterPendingFixed: summary.spendingPower.remainingVariableBudget,
    fixedExpenseItems: summary.nextFixedExpense
      ? [
          {
            fixedExpense: {
              id: summary.nextFixedExpense.id,
              name: summary.nextFixedExpense.name,
              amount: summary.nextFixedExpense.amount,
              categoryId: "fixed-expense",
              categoryName: "Gasto fijo",
              recurrence: "monthly",
              paymentWindowStartDay: Number(summary.nextFixedExpense.dueDate.slice(8, 10)),
              paymentWindowEndDay: Number(summary.nextFixedExpense.dueDate.slice(8, 10)),
              activeFromMonth: `${summary.month}-01`,
              includeInForecast: true,
              isActive: true,
              syncStatus: "synced",
              clientCreatedAt: summary.nextFixedExpense.dueDate,
              clientUpdatedAt: summary.nextFixedExpense.dueDate,
              createdAt: summary.nextFixedExpense.dueDate,
              updatedAt: summary.nextFixedExpense.dueDate,
            },
            status: "pending",
            dueSoon: summary.nextFixedExpense.daysLeft >= 0 && summary.nextFixedExpense.daysLeft <= 7,
            overdue: summary.nextFixedExpense.daysLeft < 0,
          },
        ]
      : [],
    warnings,
  };

  return {
    monthlySummary: {
      income: plannedIncome,
      actualIncome: summary.income.received,
      expectedIncome: summary.income.expected,
      expense: summary.expenses.spent,
      balance: summary.balance.current,
      budget: summary.budget.monthlyBudget,
      budgetUsedPercentage: summary.budget.usedPercentage,
    },
    forecast,
    recentMovements: summary.recentMovements,
  };
}

function buildWarnings(summary: DashboardSummary): BudgetWarning[] {
  const warnings: BudgetWarning[] = [];

  if (summary.balance.status !== "healthy") {
    warnings.push({
      id: "dashboard-balance-status",
      type: summary.balance.status === "risk" ? "projected_budget_exceeded" : "low_safe_daily_spend",
      severity: summary.balance.status === "risk" ? "danger" : "warning",
      title: summary.balance.status === "risk" ? "Riesgo en el cierre del mes" : "Atención al ritmo del mes",
      message: summary.balance.message,
    });
  }

  if (summary.nextFixedExpense && summary.nextFixedExpense.daysLeft <= 7) {
    warnings.push({
      id: `dashboard-next-fixed-${summary.nextFixedExpense.id}`,
      type: summary.nextFixedExpense.daysLeft < 0 ? "fixed_payment_overdue" : "fixed_payment_due_soon",
      severity: summary.nextFixedExpense.daysLeft < 0 ? "danger" : "info",
      title: summary.nextFixedExpense.daysLeft < 0 ? `${summary.nextFixedExpense.name} está pendiente` : `${summary.nextFixedExpense.name} se acerca`,
      message: `Pago programado para ${summary.nextFixedExpense.dueDate}.`,
      relatedFixedExpenseId: summary.nextFixedExpense.id,
    });
  }

  const categoryWarning = (summary.categoriesToWatch ?? []).find((category) => category.status !== "ok");
  if (categoryWarning) {
    warnings.push({
      id: `dashboard-category-${categoryWarning.categoryId}`,
      type: "projected_budget_exceeded",
      severity: categoryWarning.status === "danger" ? "danger" : "warning",
      title: `Revisa ${categoryWarning.name}`,
      message: `Esta categoría usa ${categoryWarning.percentage}% del presupuesto mensual.`,
    });
  }

  return warnings;
}

export type DashboardRecentMovement = {
  id: string;
  description: string;
  categoryName: string;
  amount: number;
  type: TransactionType;
  date: string;
  note?: string;
};

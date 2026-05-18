import {
  differenceInCalendarDays,
  endOfMonth,
  getDate,
  isSameMonth,
  parseISO,
  startOfMonth,
} from "date-fns";
import type { Transaction } from "@/types/finance";
import type {
  BudgetWarning,
  FixedExpense,
  FixedExpenseForecastItem,
  FixedExpenseOccurrence,
  MonthlyForecast,
} from "@/types/fixedExpenses";

type MonthlyForecastInput = {
  transactions: Transaction[];
  fixedExpenses: FixedExpense[];
  fixedExpenseOccurrences: FixedExpenseOccurrence[];
  monthlyBudget: number;
  expectedMonthlyIncome?: number;
  targetMonth: Date;
  today?: Date;
};

export function getMonthlyForecast(input: MonthlyForecastInput): MonthlyForecast {
  const today = input.today ?? new Date();
  const monthTransactions = input.transactions.filter(
    (transaction) => !transaction.deletedAt && isSameMonth(parseISO(transaction.transactionDate), input.targetMonth),
  );
  const actualIncome = sum(monthTransactions.filter((transaction) => transaction.type === "income"));
  const incomeBasis = Math.max(actualIncome, input.expectedMonthlyIncome ?? 0);
  const expenseTransactions = monthTransactions.filter((transaction) => transaction.type === "expense");
  const actualExpenses = sum(expenseTransactions);
  const activeFixedExpenses = getFixedExpensesForMonth(input.fixedExpenses, input.targetMonth);
  const fixedExpenseItems = buildFixedExpenseItems(activeFixedExpenses, input.fixedExpenseOccurrences, input.targetMonth, today);
  const paidTransactionIds = new Set(
    fixedExpenseItems
      .filter((item) => item.status === "paid" && item.occurrence?.transactionId)
      .map((item) => item.occurrence!.transactionId!),
  );
  const actualFixedExpensesPaid = expenseTransactions
    .filter((transaction) => transaction.fixedExpenseId || transaction.fixedExpenseOccurrenceId || paidTransactionIds.has(transaction.id))
    .reduce((total, transaction) => total + transaction.amount, 0);
  const actualVariableExpenses = Math.max(0, actualExpenses - actualFixedExpensesPaid);
  const pendingFixedExpenses = fixedExpenseItems
    .filter((item) => item.status === "pending" && item.fixedExpense.includeInForecast)
    .reduce((total, item) => total + item.fixedExpense.amount, 0);
  const skippedFixedExpenses = fixedExpenseItems
    .filter((item) => item.status === "skipped")
    .reduce((total, item) => total + item.fixedExpense.amount, 0);
  const projectedVariableExpenses = projectVariableExpenses(actualVariableExpenses, input.targetMonth, today);
  const projectedMonthEndExpenses = actualFixedExpensesPaid + pendingFixedExpenses + projectedVariableExpenses;
  const projectedBalance = incomeBasis - projectedMonthEndExpenses;
  const remainingAfterPendingFixed = input.monthlyBudget - actualExpenses - pendingFixedExpenses;
  const safeDailySpend = getSafeDailySpend({
    monthlyBudget: input.monthlyBudget,
    actualExpenses,
    pendingFixedExpenses,
    targetMonth: input.targetMonth,
    today,
  });
  const budgetUsedPercentage = input.monthlyBudget > 0 ? Math.round((projectedMonthEndExpenses / input.monthlyBudget) * 100) : 0;

  const forecast: MonthlyForecast = {
    actualIncome: incomeBasis,
    actualExpenses,
    actualFixedExpensesPaid,
    actualVariableExpenses,
    pendingFixedExpenses,
    skippedFixedExpenses,
    projectedVariableExpenses,
    projectedMonthEndExpenses,
    projectedBalance,
    safeDailySpend,
    budgetUsedPercentage,
    remainingAfterPendingFixed,
    fixedExpenseItems,
    warnings: [],
  };

  return {
    ...forecast,
    warnings: getBudgetWarnings(forecast, input.monthlyBudget),
  };
}

export function getFixedExpensesForMonth(fixedExpenses: FixedExpense[], targetMonth: Date) {
  const target = startOfMonth(targetMonth);
  return fixedExpenses.filter((fixedExpense) => {
    if (fixedExpense.deletedAt || !fixedExpense.isActive) {
      return false;
    }

    const activeFrom = startOfMonth(parseISO(fixedExpense.activeFromMonth));
    const activeUntil = fixedExpense.activeUntilMonth ? startOfMonth(parseISO(fixedExpense.activeUntilMonth)) : null;
    return target >= activeFrom && (!activeUntil || target <= activeUntil);
  });
}

export function getUpcomingFixedExpenses(forecast: MonthlyForecast) {
  return forecast.fixedExpenseItems.filter((item) => item.status === "pending" && !item.overdue);
}

export function getSafeDailySpend(input: {
  monthlyBudget: number;
  actualExpenses: number;
  pendingFixedExpenses: number;
  targetMonth: Date;
  today: Date;
}) {
  const remaining = input.monthlyBudget - input.actualExpenses - input.pendingFixedExpenses;
  const daysRemaining = Math.max(1, differenceInCalendarDays(endOfMonth(input.targetMonth), input.today) + 1);
  return Math.max(0, remaining / daysRemaining);
}

export function getBudgetWarnings(forecast: MonthlyForecast, monthlyBudget: number): BudgetWarning[] {
  const warnings: BudgetWarning[] = [];

  for (const item of forecast.fixedExpenseItems) {
    if (item.status !== "pending") {
      continue;
    }

    if (item.overdue) {
      warnings.push({
        id: `fixed-overdue-${item.fixedExpense.id}`,
        type: "fixed_payment_overdue",
        severity: "danger",
        title: `${item.fixedExpense.name} está pendiente`,
        message: `La ventana de pago terminó el día ${item.fixedExpense.paymentWindowEndDay}.`,
        relatedFixedExpenseId: item.fixedExpense.id,
      });
    } else if (item.dueSoon) {
      warnings.push({
        id: `fixed-due-${item.fixedExpense.id}`,
        type: "fixed_payment_due_soon",
        severity: "info",
        title: `${item.fixedExpense.name} se acerca`,
        message: `Págalo entre el día ${item.fixedExpense.paymentWindowStartDay} y ${item.fixedExpense.paymentWindowEndDay}.`,
        relatedFixedExpenseId: item.fixedExpense.id,
      });
    }
  }

  if (monthlyBudget > 0 && forecast.projectedMonthEndExpenses > monthlyBudget) {
    warnings.push({
      id: "projected-budget-exceeded",
      type: "projected_budget_exceeded",
      severity: "warning",
      title: "La proyección rebasa tu presupuesto",
      message: "Con el ritmo actual, el cierre de mes podría quedar por encima del límite definido.",
    });
  }

  if (monthlyBudget > 0 && (forecast.actualFixedExpensesPaid + forecast.pendingFixedExpenses) / monthlyBudget > 0.55) {
    warnings.push({
      id: "high-fixed-ratio",
      type: "high_fixed_expense_ratio",
      severity: "info",
      title: "Gran parte del presupuesto ya está comprometida",
      message: "Tus gastos fijos ocupan más de la mitad del presupuesto mensual.",
    });
  }

  if (forecast.safeDailySpend > 0 && forecast.safeDailySpend < 150) {
    warnings.push({
      id: "low-safe-daily-spend",
      type: "low_safe_daily_spend",
      severity: "warning",
      title: "Margen diario bajo",
      message: "Conviene bajar el ritmo de gastos variables durante los siguientes días.",
    });
  }

  if (monthlyBudget > 0 && forecast.remainingAfterPendingFixed < 0) {
    warnings.push({
      id: "budget-after-fixed-negative",
      type: "budget_after_fixed_negative",
      severity: "danger",
      title: "Los compromisos superan el margen disponible",
      message: "Después de gastos reales y fijos pendientes, el presupuesto queda en negativo.",
    });
  }

  return warnings;
}

function buildFixedExpenseItems(
  fixedExpenses: FixedExpense[],
  occurrences: FixedExpenseOccurrence[],
  targetMonth: Date,
  today: Date,
): FixedExpenseForecastItem[] {
  return fixedExpenses.map((fixedExpense) => {
    const occurrence = occurrences.find(
      (candidate) =>
        !candidate.deletedAt &&
        candidate.fixedExpenseId === fixedExpense.id &&
        isSameMonth(parseISO(candidate.occurrenceMonth), targetMonth),
    );
    const status = occurrence?.status ?? "pending";
    const day = getDate(today);

    return {
      fixedExpense,
      occurrence,
      status,
      dueSoon:
        status === "pending" &&
        isSameMonth(today, targetMonth) &&
        day >= Math.max(1, fixedExpense.paymentWindowStartDay - 2) &&
        day <= fixedExpense.paymentWindowEndDay,
      overdue: status === "pending" && isSameMonth(today, targetMonth) && day > fixedExpense.paymentWindowEndDay,
    };
  });
}

function projectVariableExpenses(actualVariableExpenses: number, targetMonth: Date, today: Date) {
  if (!isSameMonth(targetMonth, today)) {
    return actualVariableExpenses;
  }

  const elapsedDays = Math.max(1, getDate(today));
  const daysInMonth = getDate(endOfMonth(targetMonth));
  return (actualVariableExpenses / elapsedDays) * daysInMonth;
}

function sum(transactions: Transaction[]) {
  return transactions.reduce((total, transaction) => total + transaction.amount, 0);
}

import {
  differenceInCalendarDays,
  format,
  getDaysInMonth,
  isSameDay,
  parseISO,
} from "date-fns";
import { getMonthlyForecast } from "@/lib/finance/forecastEngine";
import { getAllFixedExpenses } from "@/lib/offline/fixedExpenseRepository";
import { getOccurrencesByMonth } from "@/lib/offline/fixedExpenseOccurrenceRepository";
import { getAllTransactions } from "@/lib/offline/transactionRepository";
import { getExpectedMonthlyIncomeSetting, getMonthlyBudgetSetting } from "@/lib/offline/db";
import type { DashboardSummary } from "@/types/dashboard";
import type { FixedExpenseForecastItem } from "@/types/fixedExpenses";
import type { Transaction } from "@/types/finance";

type BuildLocalDashboardSummaryOptions = {
  remoteSummary?: DashboardSummary;
  today?: Date;
};

export async function buildLocalDashboardSummary(
  month: string,
  options: BuildLocalDashboardSummaryOptions = {},
): Promise<DashboardSummary | undefined> {
  const targetMonth = parseDashboardMonth(month);
  const today = options.today ?? new Date();
  const [transactions, fixedExpenses, fixedExpenseOccurrences, storedBudget, storedExpectedIncome] = await Promise.all([
    getAllTransactions(),
    getAllFixedExpenses(),
    getOccurrencesByMonth(targetMonth),
    getMonthlyBudgetSetting(),
    getExpectedMonthlyIncomeSetting(),
  ]);

  const hasLocalRecords = transactions.length > 0 || fixedExpenses.length > 0 || fixedExpenseOccurrences.length > 0;
  const remoteHasActivity = options.remoteSummary ? !isRemoteSummaryEmpty(options.remoteSummary) : false;

  if (!hasLocalRecords && !options.remoteSummary) {
    return undefined;
  }

  if (!hasLocalRecords && remoteHasActivity) {
    return undefined;
  }

  const monthlyBudget = storedBudget || options.remoteSummary?.budget.monthlyBudget || 0;
  const expectedMonthlyIncome = storedExpectedIncome || options.remoteSummary?.income.expected || 0;
  const forecast = getMonthlyForecast({
    transactions,
    fixedExpenses,
    fixedExpenseOccurrences,
    monthlyBudget,
    expectedMonthlyIncome,
    targetMonth,
    today,
  });
  const monthTransactions = transactions
    .filter((transaction) => !transaction.deletedAt && isTransactionInMonth(transaction, targetMonth))
    .sort(sortTransactionsDesc);
  const actualIncome = monthTransactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const actualExpenses = monthTransactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const expectedIncome = Math.max(expectedMonthlyIncome, actualIncome, options.remoteSummary?.income.expected ?? 0);
  const projectedEndOfMonth = expectedIncome - forecast.projectedMonthEndExpenses;
  const usedPercentage = monthlyBudget > 0 ? Math.round((actualExpenses / monthlyBudget) * 100) : 0;
  const nextFixedExpense = getNextFixedExpense(forecast.fixedExpenseItems, targetMonth, today);

  return {
    month,
    balance: {
      current: actualIncome - actualExpenses,
      projectedEndOfMonth,
      status: getBalanceStatus(projectedEndOfMonth, usedPercentage),
      message: getBalanceMessage({
        actualIncome,
        actualExpenses,
        fixedPending: forecast.pendingFixedExpenses,
        projectedEndOfMonth,
      }),
    },
    spendingPower: {
      safeToSpendToday: forecast.safeDailySpend,
      recommendedDailySpend: forecast.safeDailySpend,
      remainingVariableBudget: Math.max(0, forecast.remainingAfterPendingFixed),
    },
    income: {
      expected: expectedIncome,
      received: actualIncome,
      pending: Math.max(0, expectedIncome - actualIncome),
    },
    expenses: {
      spent: actualExpenses,
      fixedPending: forecast.pendingFixedExpenses,
      variableSpent: forecast.actualVariableExpenses,
    },
    budget: {
      monthlyBudget,
      used: actualExpenses,
      usedPercentage,
    },
    nextFixedExpense,
    recommendedAction: getRecommendedAction({
      hasMovementToday: monthTransactions.some((transaction) => isSameDay(parseISO(transaction.transactionDate), today)),
      nextFixedExpense,
      categoriesToWatch: options.remoteSummary?.categoriesToWatch ?? [],
    }),
    categoriesToWatch: options.remoteSummary?.categoriesToWatch ?? [],
    recentMovements: monthTransactions.slice(0, 5).map(toRecentMovement),
    habit: {
      currentStreakDays: options.remoteSummary?.habit.currentStreakDays ?? 0,
      registrationCoveragePercentage: options.remoteSummary?.habit.registrationCoveragePercentage ?? 0,
      message: monthTransactions.length > 0
        ? "Tus movimientos locales están reflejados en el resumen del mes."
        : options.remoteSummary?.habit.message ?? "Registra tu primer movimiento.",
    },
  };
}

function parseDashboardMonth(month: string) {
  return parseISO(`${month}-01`);
}

function isRemoteSummaryEmpty(summary: DashboardSummary) {
  return (
    summary.recentMovements.length === 0 &&
    summary.income.received === 0 &&
    summary.expenses.spent === 0 &&
    summary.expenses.fixedPending === 0 &&
    !summary.nextFixedExpense
  );
}

function isTransactionInMonth(transaction: Transaction, targetMonth: Date) {
  return transaction.transactionDate.startsWith(format(targetMonth, "yyyy-MM"));
}

function sortTransactionsDesc(a: Transaction, b: Transaction) {
  return b.transactionDate.localeCompare(a.transactionDate) || b.updatedAt.localeCompare(a.updatedAt);
}

function toRecentMovement(transaction: Transaction) {
  return {
    id: transaction.id,
    description: transaction.note || transaction.categoryName,
    categoryName: transaction.categoryName,
    amount: transaction.amount,
    type: transaction.type,
    date: transaction.transactionDate,
    note: transaction.note,
  };
}

function getNextFixedExpense(items: FixedExpenseForecastItem[], targetMonth: Date, today: Date) {
  const nextItem = items
    .filter((item) => item.status === "pending" && item.fixedExpense.includeInForecast)
    .sort((a, b) => a.fixedExpense.paymentWindowStartDay - b.fixedExpense.paymentWindowStartDay)[0];

  if (!nextItem) {
    return undefined;
  }

  const dueDate = getFixedExpenseDueDate(targetMonth, nextItem.fixedExpense.paymentWindowStartDay);

  return {
    id: nextItem.fixedExpense.id,
    name: nextItem.fixedExpense.name,
    amount: nextItem.fixedExpense.amount,
    dueDate,
    daysLeft: differenceInCalendarDays(parseISO(dueDate), today),
  };
}

function getFixedExpenseDueDate(targetMonth: Date, day: number) {
  const month = format(targetMonth, "yyyy-MM");
  const clampedDay = Math.min(Math.max(day, 1), getDaysInMonth(targetMonth));
  return `${month}-${String(clampedDay).padStart(2, "0")}`;
}

function getBalanceStatus(projectedEndOfMonth: number, usedPercentage: number): DashboardSummary["balance"]["status"] {
  if (projectedEndOfMonth < 0 || usedPercentage >= 100) {
    return "risk";
  }
  if (usedPercentage >= 80) {
    return "warning";
  }
  return "healthy";
}

function getBalanceMessage(input: {
  actualIncome: number;
  actualExpenses: number;
  fixedPending: number;
  projectedEndOfMonth: number;
}) {
  if (input.actualIncome === 0 && input.actualExpenses === 0 && input.fixedPending === 0) {
    return "Aún no hay movimientos este mes. Registra tus datos para activar el command center.";
  }

  if (input.projectedEndOfMonth < 0) {
    return "Tus registros muestran presión contra el presupuesto del mes.";
  }

  if (input.fixedPending > 0) {
    return "Tus movimientos ya cuentan; aún quedan pagos fijos por cubrir.";
  }

  return "Tus movimientos registrados ya están reflejados en el mes.";
}

function getRecommendedAction(input: {
  hasMovementToday: boolean;
  nextFixedExpense?: DashboardSummary["nextFixedExpense"];
  categoriesToWatch: DashboardSummary["categoriesToWatch"];
}): DashboardSummary["recommendedAction"] {
  if (input.nextFixedExpense && input.nextFixedExpense.daysLeft <= 7) {
    return {
      type: "reserve_fixed_expense",
      title: `Revisa ${input.nextFixedExpense.name}`,
      description: "Tienes un gasto fijo pendiente dentro de la ventana cercana.",
      ctaLabel: "Ver gastos fijos",
      targetPath: "/fixed-expenses",
      priority: input.nextFixedExpense.daysLeft < 0 ? "high" : "medium",
    };
  }

  const categoryToWatch = input.categoriesToWatch.find((category) => category.status !== "ok");
  if (categoryToWatch) {
    return {
      type: "review_category",
      title: `Revisa ${categoryToWatch.name}`,
      description: `Esta categoría ya usa ${categoryToWatch.percentage}% de su presupuesto.`,
      ctaLabel: "Ver categorías",
      targetPath: "/categories",
      priority: categoryToWatch.status === "danger" ? "high" : "medium",
    };
  }

  if (!input.hasMovementToday) {
    return {
      type: "register_movement",
      title: "Registra tu movimiento de hoy",
      description: "Mantener el registro diario ayuda a que tu presupuesto sea confiable.",
      ctaLabel: "Nuevo movimiento",
      targetPath: "/new",
      priority: "low",
    };
  }

  return undefined;
}

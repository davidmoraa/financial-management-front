import {
  differenceInCalendarDays,
  format,
  getDaysInMonth,
  subDays,
  parseISO,
} from "date-fns";
import { getMonthlyForecast } from "@/lib/finance/forecastEngine";
import { formatCurrency } from "@/lib/formatters";
import { getExpectedMonthlyIncomeSetting, getMonthlyBudgetSetting } from "@/lib/offline/db";
import { getAllFixedExpenses } from "@/lib/offline/fixedExpenseRepository";
import { getOccurrencesByMonth } from "@/lib/offline/fixedExpenseOccurrenceRepository";
import { getAllTransactions } from "@/lib/offline/transactionRepository";
import type { DashboardPeriod, DashboardSummary } from "@/types/dashboard";
import type { FixedExpenseForecastItem } from "@/types/fixedExpenses";
import type { Transaction } from "@/types/finance";

type BuildLocalDashboardSummaryOptions = {
  period?: DashboardPeriod;
  remoteSummary?: DashboardSummary;
  today?: Date;
};

export async function buildLocalDashboardSummary(
  month: string,
  options: BuildLocalDashboardSummaryOptions = {},
): Promise<DashboardSummary | undefined> {
  const targetMonth = parseISO(`${month}-01`);
  const today = options.today ?? new Date();
  const period = options.period ?? {
    type: "monthly",
    label: format(targetMonth, "MMMM yyyy"),
    shortLabel: "Mes actual",
    startsAt: `${month}-01`,
    endsAt: `${month}-${String(getDaysInMonth(targetMonth)).padStart(2, "0")}`,
  };
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

  if (!hasLocalRecords && remoteHasActivity && period.type === "monthly") {
    return undefined;
  }

  const monthlyBudget = storedBudget || options.remoteSummary?.budget.monthlyBudget || 0;
  const expectedMonthlyIncome = storedExpectedIncome || options.remoteSummary?.income.expected || 0;
  const periodRatio = getPeriodRatio(period, targetMonth);
  const periodBudget = Math.round(monthlyBudget * periodRatio);
  const periodExpectedIncome = Math.round(expectedMonthlyIncome * periodRatio);
  const monthForecast = getMonthlyForecast({
    transactions,
    fixedExpenses,
    fixedExpenseOccurrences,
    monthlyBudget,
    expectedMonthlyIncome,
    targetMonth,
    today,
  });
  const periodTransactions = transactions
    .filter((transaction) => !transaction.deletedAt && isTransactionInPeriod(transaction, period))
    .sort(sortTransactionsDesc);
  const habit = buildHabit({
    allTransactions: transactions.filter((transaction) => !transaction.deletedAt),
    period,
    periodTransactions,
    remoteHabit: options.remoteSummary?.habit,
    today,
  });
  const incomeTransactions = periodTransactions.filter((transaction) => transaction.type === "income");
  const expenseTransactions = periodTransactions.filter((transaction) => transaction.type === "expense");
  const actualIncome = sumTransactions(incomeTransactions);
  const actualExpenses = sumTransactions(expenseTransactions);
  const periodFixedItems = monthForecast.fixedExpenseItems.filter((item) => fixedExpenseIntersectsPeriod(item, period));
  const paidTransactionIds = new Set(
    periodFixedItems
      .filter((item) => item.status === "paid" && item.occurrence?.transactionId)
      .map((item) => item.occurrence!.transactionId!),
  );
  const actualFixedExpensesPaid = expenseTransactions
    .filter((transaction) => transaction.fixedExpenseId || transaction.fixedExpenseOccurrenceId || paidTransactionIds.has(transaction.id))
    .reduce((total, transaction) => total + transaction.amount, 0);
  const actualVariableExpenses = Math.max(0, actualExpenses - actualFixedExpensesPaid);
  const pendingFixedExpenses = periodFixedItems
    .filter((item) => item.status === "pending" && item.fixedExpense.includeInForecast)
    .reduce((total, item) => total + item.fixedExpense.amount, 0);
  const projectedVariableExpenses = projectVariableExpensesForPeriod(actualVariableExpenses, period, today);
  const expectedIncome = Math.max(periodExpectedIncome, actualIncome);
  const projectedExpenses = actualFixedExpensesPaid + pendingFixedExpenses + projectedVariableExpenses;
  const projectedEndOfPeriod = expectedIncome - projectedExpenses;
  const remainingVariableBudget = Math.max(0, periodBudget - actualExpenses - pendingFixedExpenses);
  const safeToSpendToday = getPeriodSafeDailySpend({
    actualExpenses,
    pendingFixedExpenses,
    period,
    periodBudget,
    today,
  });
  const dailyEnvelope = buildDailyEnvelope({
    expenseTransactions,
    paidTransactionIds,
    period,
    periodBudget,
    remainingVariableBudget,
    today,
  });
  const usedPercentage = periodBudget > 0 ? Math.round((actualExpenses / periodBudget) * 100) : 0;
  const nextFixedExpense = getNextFixedExpense(periodFixedItems, targetMonth, today);

  return {
    month,
    period,
    balance: {
      current: actualIncome - actualExpenses,
      projectedEndOfMonth: projectedEndOfPeriod,
      status: getBalanceStatus(projectedEndOfPeriod, usedPercentage),
      message: getBalanceMessage({
        actualIncome,
        actualExpenses,
        fixedPending: pendingFixedExpenses,
        period,
        projectedEndOfPeriod,
      }),
    },
    spendingPower: {
      safeToSpendToday,
      recommendedDailySpend: safeToSpendToday,
      remainingVariableBudget,
      protectedForObligations: options.remoteSummary?.spendingPower.protectedForObligations ?? pendingFixedExpenses,
      protectedForCreditCards: options.remoteSummary?.spendingPower.protectedForCreditCards ?? 0,
      protectedForSavings: options.remoteSummary?.spendingPower.protectedForSavings ?? 0,
    },
    dailyEnvelope,
    income: {
      expected: expectedIncome,
      received: actualIncome,
      pending: Math.max(0, expectedIncome - actualIncome),
    },
    expenses: {
      spent: actualExpenses,
      fixedPending: pendingFixedExpenses,
      variableSpent: actualVariableExpenses,
    },
    budget: {
      monthlyBudget: periodBudget,
      used: actualExpenses,
      usedPercentage,
    },
    nextFixedExpense,
    upcomingObligations: options.remoteSummary?.upcomingObligations ?? [],
    recommendedAction: getRecommendedAction({
      categoriesToWatch: options.remoteSummary?.categoriesToWatch ?? [],
      hasMovementToday: periodTransactions.some((transaction) => toDashboardDateKey(transaction.transactionDate) === format(today, "yyyy-MM-dd")),
      nextFixedExpense,
    }),
    insights: options.remoteSummary?.insights ?? [],
    categoriesToWatch: options.remoteSummary?.categoriesToWatch ?? [],
    recentMovements: periodTransactions.slice(0, 5).map(toRecentMovement),
    habit,
  };
}

function isRemoteSummaryEmpty(summary: DashboardSummary) {
  return (
    (summary.recentMovements ?? []).length === 0 &&
    (summary.upcomingObligations ?? []).length === 0 &&
    summary.income.received === 0 &&
    summary.expenses.spent === 0 &&
    summary.expenses.fixedPending === 0 &&
    !summary.nextFixedExpense
  );
}

function isTransactionInPeriod(transaction: Transaction, period: DashboardPeriod) {
  const transactionDate = toDashboardDateKey(transaction.transactionDate);
  return transactionDate >= period.startsAt && transactionDate <= period.endsAt;
}

function fixedExpenseIntersectsPeriod(item: FixedExpenseForecastItem, period: DashboardPeriod) {
  const month = period.startsAt.slice(0, 7);
  const startDate = `${month}-${String(item.fixedExpense.paymentWindowStartDay).padStart(2, "0")}`;
  const endDate = `${month}-${String(item.fixedExpense.paymentWindowEndDay).padStart(2, "0")}`;
  return startDate <= period.endsAt && endDate >= period.startsAt;
}

function sortTransactionsDesc(a: Transaction, b: Transaction) {
  return toDashboardDateKey(b.transactionDate).localeCompare(toDashboardDateKey(a.transactionDate)) || b.updatedAt.localeCompare(a.updatedAt);
}

function toRecentMovement(transaction: Transaction) {
  return {
    id: transaction.id,
    description: transaction.note || transaction.categoryName,
    categoryName: transaction.categoryName,
    amount: transaction.amount,
    type: transaction.type,
    date: toDashboardDateKey(transaction.transactionDate),
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

function getPeriodRatio(period: DashboardPeriod, targetMonth: Date) {
  if (period.type === "monthly") {
    return 1;
  }

  if (period.type === "biweekly") {
    return 0.5;
  }

  const daysInPeriod = differenceInCalendarDays(parseISO(period.endsAt), parseISO(period.startsAt)) + 1;
  return daysInPeriod / getDaysInMonth(targetMonth);
}

function getPeriodSafeDailySpend(input: {
  actualExpenses: number;
  pendingFixedExpenses: number;
  period: DashboardPeriod;
  periodBudget: number;
  today: Date;
}) {
  const remaining = input.periodBudget - input.actualExpenses - input.pendingFixedExpenses;
  const todayKey = format(input.today, "yyyy-MM-dd");
  const effectiveStart = todayKey > input.period.startsAt ? todayKey : input.period.startsAt;
  const daysRemaining = Math.max(1, differenceInCalendarDays(parseISO(input.period.endsAt), parseISO(effectiveStart)) + 1);
  return Math.max(0, remaining / daysRemaining);
}

function buildDailyEnvelope(input: {
  expenseTransactions: Transaction[];
  paidTransactionIds: Set<string>;
  period: DashboardPeriod;
  periodBudget: number;
  remainingVariableBudget: number;
  today: Date;
}): NonNullable<DashboardSummary["dailyEnvelope"]> {
  const todayKey = format(input.today, "yyyy-MM-dd");
  const envelopeDate = clampDateKey(todayKey, input.period.startsAt, input.period.endsAt);
  const spentToday = roundMoney(input.expenseTransactions
    .filter((transaction) => (
      toDashboardDateKey(transaction.transactionDate) === envelopeDate &&
      !isFixedExpenseTransaction(transaction, input.paidTransactionIds)
    ))
    .reduce((total, transaction) => total + transaction.amount, 0));

  if (input.periodBudget <= 0) {
    return {
      date: envelopeDate,
      startingDailyAllowance: 0,
      spentToday,
      remainingToday: 0,
      isOverDailyAllowance: spentToday > 0,
      overspentToday: Math.max(0, spentToday),
      nextDaysDailyAllowanceBeforeTodaySpending: 0,
      nextDaysDailyAllowanceAfterTodaySpending: 0,
      nextDaysDailyAllowanceDelta: 0,
      message: "Registra movimientos para calcular tu margen diario.",
    };
  }

  const daysIncludingToday = getRemainingPeriodDays(input.period, input.today);
  const daysAfterToday = getDaysAfterToday(input.period, input.today);
  const availableBeforeTodaySpending = roundMoney(input.remainingVariableBudget + spentToday);
  const startingDailyAllowance = roundMoney(Math.max(0, availableBeforeTodaySpending / daysIncludingToday));
  const remainingToday = roundMoney(Math.max(0, startingDailyAllowance - spentToday));
  const overspentToday = roundMoney(Math.max(0, spentToday - startingDailyAllowance));
  const nextDaysDailyAllowanceBeforeTodaySpending = daysAfterToday > 0
    ? startingDailyAllowance
    : 0;
  const nextDaysDailyAllowanceAfterTodaySpending = daysAfterToday > 0
    ? roundMoney(Math.max(0, input.remainingVariableBudget / daysIncludingToday))
    : 0;
  const nextDaysDailyAllowanceDelta = roundMoney(nextDaysDailyAllowanceAfterTodaySpending - nextDaysDailyAllowanceBeforeTodaySpending);

  return {
    date: envelopeDate,
    startingDailyAllowance,
    spentToday,
    remainingToday,
    isOverDailyAllowance: overspentToday > 0,
    overspentToday,
    nextDaysDailyAllowanceBeforeTodaySpending,
    nextDaysDailyAllowanceAfterTodaySpending,
    nextDaysDailyAllowanceDelta,
    message: buildDailyEnvelopeMessage({
      nextDaysDailyAllowanceAfterTodaySpending,
      overspentToday,
      remainingToday,
    }),
  };
}

function isFixedExpenseTransaction(transaction: Transaction, paidTransactionIds: Set<string>) {
  return Boolean(transaction.fixedExpenseId || transaction.fixedExpenseOccurrenceId || paidTransactionIds.has(transaction.id));
}

function buildDailyEnvelopeMessage(input: {
  nextDaysDailyAllowanceAfterTodaySpending: number;
  overspentToday: number;
  remainingToday: number;
}) {
  if (input.overspentToday > 0) {
    return `Te pasaste por ${formatCurrency(input.overspentToday)} hoy. Tu margen diario desde mañana baja a ${formatCurrency(input.nextDaysDailyAllowanceAfterTodaySpending)}.`;
  }

  if (input.remainingToday > 0) {
    return `Te quedan ${formatCurrency(input.remainingToday)} para hoy. Tu margen diario desde mañana será de ${formatCurrency(input.nextDaysDailyAllowanceAfterTodaySpending)}.`;
  }

  return "Ya usaste tu margen de hoy. Si no gastas más, mantienes estable tu proyección.";
}

function getRemainingPeriodDays(period: DashboardPeriod, today: Date) {
  const todayKey = format(today, "yyyy-MM-dd");
  const effectiveStart = todayKey > period.startsAt ? todayKey : period.startsAt;
  return Math.max(1, differenceInCalendarDays(parseISO(period.endsAt), parseISO(effectiveStart)) + 1);
}

function getDaysAfterToday(period: DashboardPeriod, today: Date) {
  const todayKey = format(today, "yyyy-MM-dd");

  if (todayKey < period.startsAt) {
    return Math.max(0, differenceInCalendarDays(parseISO(period.endsAt), parseISO(period.startsAt)));
  }

  if (todayKey >= period.endsAt) {
    return 0;
  }

  return Math.max(0, differenceInCalendarDays(parseISO(period.endsAt), parseISO(todayKey)));
}

function clampDateKey(dateKey: string, min: string, max: string) {
  if (dateKey < min) {
    return min;
  }

  if (dateKey > max) {
    return max;
  }

  return dateKey;
}

function toDashboardDateKey(value: string) {
  if (!value.includes("T")) {
    return value.slice(0, 10);
  }

  const date = parseISO(value);
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  return format(date, "yyyy-MM-dd");
}

function roundMoney(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.round(value * 100) / 100;
}

function projectVariableExpensesForPeriod(actualVariableExpenses: number, period: DashboardPeriod, today: Date) {
  const periodStartsAt = parseISO(period.startsAt);
  const periodEndsAt = parseISO(period.endsAt);
  const periodDays = differenceInCalendarDays(periodEndsAt, periodStartsAt) + 1;
  const todayKey = format(today, "yyyy-MM-dd");

  if (todayKey < period.startsAt || todayKey > period.endsAt) {
    return actualVariableExpenses;
  }

  const elapsedDays = Math.max(1, differenceInCalendarDays(today, periodStartsAt) + 1);
  return (actualVariableExpenses / elapsedDays) * periodDays;
}

function getBalanceStatus(projectedEndOfPeriod: number, usedPercentage: number): DashboardSummary["balance"]["status"] {
  if (projectedEndOfPeriod < 0 || usedPercentage >= 100) {
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
  period: DashboardPeriod;
  projectedEndOfPeriod: number;
}) {
  if (input.actualIncome === 0 && input.actualExpenses === 0 && input.fixedPending === 0) {
    return `Aún no hay movimientos en ${input.period.shortLabel.toLowerCase()}. Registra tus datos para activar el command center.`;
  }

  if (input.projectedEndOfPeriod < 0) {
    return `Tus registros muestran presión contra el presupuesto de ${input.period.shortLabel.toLowerCase()}.`;
  }

  if (input.fixedPending > 0) {
    return `Tus movimientos ya cuentan; aún quedan pagos fijos en ${input.period.shortLabel.toLowerCase()}.`;
  }

  return `Tus movimientos registrados ya están reflejados en ${input.period.shortLabel.toLowerCase()}.`;
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

function buildHabit(input: {
  allTransactions: Transaction[];
  period: DashboardPeriod;
  periodTransactions: Transaction[];
  remoteHabit?: DashboardSummary["habit"];
  today: Date;
}): DashboardSummary["habit"] {
  const todayKey = format(input.today, "yyyy-MM-dd");
  const transactionDates = new Set(input.allTransactions.map((transaction) => toDashboardDateKey(transaction.transactionDate)));
  const hasAnyTransaction = transactionDates.size > 0;
  const hasTransactionToday = transactionDates.has(todayKey);
  const streakAnchor = hasTransactionToday ? input.today : subDays(input.today, 1);
  let currentStreakDays = 0;
  let cursor = streakAnchor;

  while (transactionDates.has(format(cursor, "yyyy-MM-dd"))) {
    currentStreakDays += 1;
    cursor = subDays(cursor, 1);
  }

  const elapsedDays = getElapsedPeriodDays(input.period, input.today);
  const activePeriodDates = new Set(input.periodTransactions.map((transaction) => toDashboardDateKey(transaction.transactionDate)));
  const registrationCoveragePercentage = elapsedDays > 0
    ? Math.min(100, Math.round((activePeriodDates.size / elapsedDays) * 100))
    : 0;
  const effectiveStreakDays = Math.max(currentStreakDays, input.remoteHabit?.currentStreakDays ?? 0);
  const nextMilestoneDays = getNextMilestone(effectiveStreakDays);
  const daysToNextMilestone = Math.max(0, nextMilestoneDays - effectiveStreakDays);
  const milestoneProgressPercentage = nextMilestoneDays > 0
    ? Math.min(100, Math.round((effectiveStreakDays / nextMilestoneDays) * 100))
    : 0;
  const isAtRisk = effectiveStreakDays > 0 && !hasTransactionToday;

  return {
    currentStreakDays: effectiveStreakDays,
    daysToNextMilestone,
    isAtRisk,
    milestoneProgressPercentage,
    nextMilestoneDays,
    registrationCoveragePercentage: Math.max(registrationCoveragePercentage, input.remoteHabit?.registrationCoveragePercentage ?? 0),
    message: getHabitMessage({
      currentStreakDays,
      daysToNextMilestone,
      hasAnyTransaction,
      hasTransactionToday,
      isAtRisk,
      nextMilestoneDays,
    }),
  };
}

function getElapsedPeriodDays(period: DashboardPeriod, today: Date) {
  const todayKey = format(today, "yyyy-MM-dd");
  const effectiveEnd = todayKey < period.endsAt ? todayKey : period.endsAt;

  if (effectiveEnd < period.startsAt) {
    return 0;
  }

  return differenceInCalendarDays(parseISO(effectiveEnd), parseISO(period.startsAt)) + 1;
}

function getNextMilestone(currentStreakDays: number) {
  const milestones = [3, 7, 14, 30, 60, 100];
  return milestones.find((milestone) => milestone > currentStreakDays) ?? currentStreakDays + 30;
}

function getHabitMessage(input: {
  currentStreakDays: number;
  daysToNextMilestone: number;
  hasAnyTransaction: boolean;
  hasTransactionToday: boolean;
  isAtRisk: boolean;
  nextMilestoneDays: number;
}) {
  if (!input.hasAnyTransaction) {
    return "Registra tu primer movimiento para iniciar una racha financiera.";
  }

  if (input.isAtRisk) {
    return `Tu racha de ${input.currentStreakDays} dia${input.currentStreakDays === 1 ? "" : "s"} sigue viva. Registra hoy para conservarla.`;
  }

  if (input.daysToNextMilestone === 0) {
    return `Meta de ${input.nextMilestoneDays} dias alcanzada. Sigue acumulando claridad.`;
  }

  return `Faltan ${input.daysToNextMilestone} dia${input.daysToNextMilestone === 1 ? "" : "s"} para llegar a ${input.nextMilestoneDays} dias de racha.`;
}

function sumTransactions(transactions: Transaction[]) {
  return transactions.reduce((total, transaction) => total + transaction.amount, 0);
}

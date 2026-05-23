import { describe, expect, it } from "vitest";
import { buildLocalDashboardSummary } from "@/lib/dashboard/localDashboardSummary";
import { createFixedExpense } from "@/lib/offline/fixedExpenseRepository";
import { markFixedExpensePaid } from "@/lib/offline/fixedExpenseOccurrenceRepository";
import { createTransaction } from "@/lib/offline/transactionRepository";
import { setIncomeSettings } from "@/lib/offline/db";
import type { DashboardSummary } from "@/types/dashboard";

const emptyRemoteSummary: DashboardSummary = {
  month: "2026-05",
  balance: {
    current: 0,
    projectedEndOfMonth: 0,
    status: "healthy",
    message: "Aún no hay movimientos este mes.",
  },
  spendingPower: {
    safeToSpendToday: 0,
    recommendedDailySpend: 0,
    remainingVariableBudget: 0,
  },
  income: {
    expected: 0,
    received: 0,
    pending: 0,
  },
  expenses: {
    spent: 0,
    fixedPending: 0,
    variableSpent: 0,
  },
  budget: {
    monthlyBudget: 0,
    used: 0,
    usedPercentage: 0,
  },
  upcomingObligations: [],
  insights: [],
  categoriesToWatch: [],
  recentMovements: [],
  habit: {
    currentStreakDays: 0,
    registrationCoveragePercentage: 0,
    message: "Registra tu primer movimiento.",
  },
};

describe("localDashboardSummary", () => {
  it("refleja pagos fijos locales pendientes de sincronizar en el dashboard", async () => {
    await setIncomeSettings({
      monthlyBudget: 15000,
      expectedIncomeAmount: 23333,
      expectedMonthlyIncome: 23333,
      incomeCadence: "monthly",
    });
    const agua = await createFixedExpense({
      name: "Agua",
      amount: 150,
      categoryId: "home",
      categoryName: "Casa",
      paymentMethod: "debit_card",
      paymentWindowStartDay: 1,
      paymentWindowEndDay: 10,
      activeFromMonth: "2026-05-01",
      includeInForecast: true,
    });
    await createFixedExpense({
      name: "Spotify",
      amount: 140,
      categoryId: "subscriptions",
      categoryName: "Suscripciones",
      paymentMethod: "credit_card",
      paymentWindowStartDay: 20,
      paymentWindowEndDay: 22,
      activeFromMonth: "2026-05-01",
      includeInForecast: true,
    });
    await markFixedExpensePaid({
      fixedExpenseId: agua.id,
      occurrenceMonth: "2026-05-01",
      transactionDate: "2026-05-20",
      amount: 150,
      paymentMethod: "debit_card",
    });

    const summary = await buildLocalDashboardSummary("2026-05", {
      remoteSummary: emptyRemoteSummary,
      today: new Date("2026-05-20T12:00:00"),
    });

    expect(summary?.expenses.spent).toBe(150);
    expect(summary?.expenses.fixedPending).toBe(140);
    expect(summary?.balance.current).toBe(-150);
    expect(summary?.recentMovements[0]).toMatchObject({
      categoryName: "Casa",
      amount: 150,
      date: "2026-05-20",
    });
    expect(summary?.nextFixedExpense).toMatchObject({
      name: "Spotify",
      amount: 140,
      dueDate: "2026-05-20",
      daysLeft: 0,
    });
    expect(summary?.balance.message).not.toMatch(/no hay movimientos/i);
  });

  it("no muestra próximo pago cuando todos los gastos fijos locales del mes están pagados", async () => {
    const fixedExpense = await createFixedExpense({
      name: "Internet",
      amount: 710,
      categoryId: "home",
      categoryName: "Casa",
      paymentMethod: "debit_card",
      paymentWindowStartDay: 1,
      paymentWindowEndDay: 8,
      activeFromMonth: "2026-05-01",
      includeInForecast: true,
    });
    await markFixedExpensePaid({
      fixedExpenseId: fixedExpense.id,
      occurrenceMonth: "2026-05-01",
      transactionDate: "2026-05-20",
      amount: 710,
      paymentMethod: "debit_card",
    });

    const summary = await buildLocalDashboardSummary("2026-05", {
      remoteSummary: {
        ...emptyRemoteSummary,
        nextFixedExpense: {
          id: fixedExpense.id,
          name: fixedExpense.name,
          amount: fixedExpense.amount,
          dueDate: "2026-05-01",
          daysLeft: -19,
        },
      },
      today: new Date("2026-05-20T12:00:00"),
    });

    expect(summary?.expenses.fixedPending).toBe(0);
    expect(summary?.nextFixedExpense).toBeUndefined();
  });

  it("calcula el resumen para la semana activa sin incluir movimientos fuera del periodo", async () => {
    await setIncomeSettings({
      monthlyBudget: 31000,
      expectedIncomeAmount: 31000,
      expectedMonthlyIncome: 31000,
      incomeCadence: "monthly",
    });
    const fixedExpense = await createFixedExpense({
      name: "Internet",
      amount: 710,
      categoryId: "home",
      categoryName: "Casa",
      paymentMethod: "debit_card",
      paymentWindowStartDay: 1,
      paymentWindowEndDay: 8,
      activeFromMonth: "2026-05-01",
      includeInForecast: true,
    });
    await markFixedExpensePaid({
      fixedExpenseId: fixedExpense.id,
      occurrenceMonth: "2026-05-01",
      transactionDate: "2026-05-04",
      amount: 710,
      paymentMethod: "debit_card",
    });

    const summary = await buildLocalDashboardSummary("2026-05", {
      remoteSummary: emptyRemoteSummary,
      today: new Date("2026-05-20T12:00:00"),
      period: {
        type: "weekly",
        label: "Semana del 18 may",
        shortLabel: "Semana actual",
        startsAt: "2026-05-18",
        endsAt: "2026-05-24",
      },
    });

    expect(summary?.period?.type).toBe("weekly");
    expect(summary?.expenses.spent).toBe(0);
    expect(summary?.recentMovements).toHaveLength(0);
    expect(summary?.budget.monthlyBudget).toBe(7000);
  });

  it("refleja el gasto local de hoy en el Daily Envelope", async () => {
    await setIncomeSettings({
      monthlyBudget: 9696,
      expectedIncomeAmount: 10000,
      expectedMonthlyIncome: 10000,
      incomeCadence: "monthly",
    });
    await createTransaction({
      type: "expense",
      amount: 122,
      categoryId: "food",
      categoryName: "Comida",
      paymentMethod: "debit_card",
      transactionDate: "2026-05-20",
    });

    const summary = await buildLocalDashboardSummary("2026-05", {
      remoteSummary: emptyRemoteSummary,
      today: new Date("2026-05-20T12:00:00"),
    });

    expect(summary?.dailyEnvelope).toMatchObject({
      startingDailyAllowance: 808,
      spentToday: 122,
      remainingToday: 686,
      isOverDailyAllowance: false,
      overspentToday: 0,
    });
    expect(summary?.dailyEnvelope?.startingDailyAllowance).not.toBe(
      summary?.dailyEnvelope?.nextDaysDailyAllowanceAfterTodaySpending,
    );
  });

  it("refleja el gasto local de hoy en el Daily Envelope aunque la fecha venga como timestamp", async () => {
    await setIncomeSettings({
      monthlyBudget: 9696,
      expectedIncomeAmount: 10000,
      expectedMonthlyIncome: 10000,
      incomeCadence: "monthly",
    });
    await createTransaction({
      type: "expense",
      amount: 122,
      categoryId: "food",
      categoryName: "Comida",
      paymentMethod: "debit_card",
      transactionDate: "2026-05-20T15:30:00.000Z",
    });

    const summary = await buildLocalDashboardSummary("2026-05", {
      remoteSummary: emptyRemoteSummary,
      today: new Date("2026-05-20T12:00:00"),
    });

    expect(summary?.expenses.spent).toBe(122);
    expect(summary?.dailyEnvelope).toMatchObject({
      startingDailyAllowance: 808,
      spentToday: 122,
      remainingToday: 686,
      isOverDailyAllowance: false,
      overspentToday: 0,
    });
  });

  it("no incrementa spentToday cuando el movimiento local de hoy es ingreso", async () => {
    await setIncomeSettings({
      monthlyBudget: 9696,
      expectedIncomeAmount: 10000,
      expectedMonthlyIncome: 10000,
      incomeCadence: "monthly",
    });
    await createTransaction({
      type: "income",
      amount: 122,
      categoryId: "salary",
      categoryName: "Sueldo",
      paymentMethod: "transfer",
      transactionDate: "2026-05-20",
    });

    const summary = await buildLocalDashboardSummary("2026-05", {
      remoteSummary: emptyRemoteSummary,
      today: new Date("2026-05-20T12:00:00"),
    });

    expect(summary?.dailyEnvelope?.spentToday).toBe(0);
    expect(summary?.dailyEnvelope?.startingDailyAllowance).toBe(808);
    expect(summary?.dailyEnvelope?.remainingToday).toBe(808);
  });

  it("calcula la racha financiera con meta progresiva cuando hay registros consecutivos", async () => {
    for (const transactionDate of ["2026-05-18", "2026-05-19", "2026-05-20"]) {
      await createTransaction({
        type: "expense",
        amount: 50,
        categoryId: "food",
        categoryName: "Comida",
        paymentMethod: "debit_card",
        transactionDate,
      });
    }

    const summary = await buildLocalDashboardSummary("2026-05", {
      remoteSummary: emptyRemoteSummary,
      today: new Date("2026-05-20T12:00:00"),
      period: {
        type: "weekly",
        label: "Semana del 18 may",
        shortLabel: "Semana actual",
        startsAt: "2026-05-18",
        endsAt: "2026-05-24",
      },
    });

    expect(summary?.habit).toMatchObject({
      currentStreakDays: 3,
      daysToNextMilestone: 4,
      isAtRisk: false,
      milestoneProgressPercentage: 43,
      nextMilestoneDays: 7,
      registrationCoveragePercentage: 100,
    });
  });

  it("mantiene la racha en riesgo cuando falta el registro de hoy", async () => {
    for (const transactionDate of ["2026-05-18", "2026-05-19"]) {
      await createTransaction({
        type: "expense",
        amount: 50,
        categoryId: "food",
        categoryName: "Comida",
        paymentMethod: "debit_card",
        transactionDate,
      });
    }

    const summary = await buildLocalDashboardSummary("2026-05", {
      remoteSummary: emptyRemoteSummary,
      today: new Date("2026-05-20T12:00:00"),
      period: {
        type: "weekly",
        label: "Semana del 18 may",
        shortLabel: "Semana actual",
        startsAt: "2026-05-18",
        endsAt: "2026-05-24",
      },
    });

    expect(summary?.habit.currentStreakDays).toBe(2);
    expect(summary?.habit.isAtRisk).toBe(true);
    expect(summary?.habit.message).toContain("Registra hoy");
  });
});

import { describe, expect, it } from "vitest";
import { buildLocalDashboardSummary } from "@/lib/dashboard/localDashboardSummary";
import { createFixedExpense } from "@/lib/offline/fixedExpenseRepository";
import { markFixedExpensePaid } from "@/lib/offline/fixedExpenseOccurrenceRepository";
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
});

import { describe, expect, it } from "vitest";
import { adaptDashboardSummary, isDashboardSummaryEmpty } from "@/lib/dashboard/dashboardSummaryAdapter";
import type { DashboardSummary } from "@/types/dashboard";

const baseSummary: DashboardSummary = {
  month: "2026-05",
  balance: {
    current: 7000,
    projectedEndOfMonth: 5200,
    status: "healthy",
    message: "Vas bien este mes.",
  },
  spendingPower: {
    safeToSpendToday: 240,
    recommendedDailySpend: 240,
    remainingVariableBudget: 2880,
  },
  income: {
    expected: 10000,
    received: 8000,
    pending: 2000,
  },
  expenses: {
    spent: 1000,
    fixedPending: 900,
    variableSpent: 600,
  },
  budget: {
    monthlyBudget: 5000,
    used: 1000,
    usedPercentage: 20,
  },
  insights: [],
  nextFixedExpense: {
    id: "fixed-1",
    name: "Internet",
    amount: 900,
    dueDate: "2026-05-25",
    daysLeft: 5,
  },
  recommendedAction: {
    type: "reserve_fixed_expense",
    title: "Aparta Internet",
    description: "Pago próximo.",
    ctaLabel: "Ver gastos fijos",
    targetPath: "/fixed-expenses",
    priority: "high",
  },
  categoriesToWatch: [],
  recentMovements: [
    {
      id: "tx-1",
      description: "Comida",
      categoryName: "Comida",
      amount: 600,
      type: "expense",
      date: "2026-05-20",
    },
  ],
  habit: {
    currentStreakDays: 1,
    registrationCoveragePercentage: 30,
    message: "Buen ritmo.",
  },
};

describe("dashboardSummaryAdapter", () => {
  it("adapta el contrato de API a las props actuales del dashboard", () => {
    const adapted = adaptDashboardSummary(baseSummary);

    expect(adapted.monthlySummary).toMatchObject({
      income: 10000,
      actualIncome: 8000,
      expense: 1000,
      balance: 7000,
      budget: 5000,
      budgetUsedPercentage: 20,
    });
    expect(adapted.forecast.pendingFixedExpenses).toBe(900);
    expect(adapted.forecast.safeDailySpend).toBe(240);
    expect(adapted.forecast.fixedExpenseItems[0]?.fixedExpense.name).toBe("Internet");
    expect(adapted.recentMovements[0]?.description).toBe("Comida");
  });

  it("detecta empty state real sin movimientos ni compromisos pendientes", () => {
    expect(isDashboardSummaryEmpty({
      ...baseSummary,
      income: { expected: 0, received: 0, pending: 0 },
      expenses: { spent: 0, fixedPending: 0, variableSpent: 0 },
      recentMovements: [],
      nextFixedExpense: undefined,
    })).toBe(true);
  });
});

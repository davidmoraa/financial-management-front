import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SafeToSpendExplanation } from "@/components/dashboard/SafeToSpendExplanation";
import type { DashboardSummary } from "@/types/dashboard";

const summary: DashboardSummary = {
  month: "2026-05",
  balance: {
    current: 0,
    projectedEndOfMonth: 1000,
    status: "healthy",
    message: "Vas bien.",
  },
  spendingPower: {
    safeToSpendToday: 430,
    recommendedDailySpend: 430,
    remainingVariableBudget: 5160,
    protectedForObligations: 14500,
    protectedForCreditCards: 4200,
    protectedForSavings: 1800,
  },
  income: {
    expected: 20000,
    received: 10000,
    pending: 10000,
  },
  expenses: {
    spent: 3000,
    fixedPending: 8500,
    variableSpent: 3000,
  },
  budget: {
    monthlyBudget: 20000,
    used: 3000,
    usedPercentage: 15,
  },
  upcomingObligations: [
    {
      id: "fixed-expense:renta",
      source: "fixed_expense",
      name: "Renta",
      amount: 8500,
      dueDate: "2026-05-25",
      priority: "essential",
      status: "pending",
    },
    {
      id: "credit-card-statement:bbva:2026-04-19:2026-05-18",
      source: "credit_card_statement",
      name: "Tarjeta BBVA",
      amount: 4200,
      dueDate: "2026-05-28",
      priority: "essential",
      status: "due_soon",
    },
    {
      id: "saving-milestone:55555555-5555-4555-8555-555555555555",
      source: "saving_milestone",
      name: "Meta Viaje",
      amount: 1800,
      dueDate: "2026-05-31",
      priority: "important",
      status: "reserved",
    },
  ],
  insights: [],
  categoriesToWatch: [],
  recentMovements: [],
  habit: {
    currentStreakDays: 0,
    registrationCoveragePercentage: 0,
    message: "Registra movimientos.",
  },
};

describe("SafeToSpendExplanation", () => {
  it("explicación renderiza breakdown", () => {
    render(<SafeToSpendExplanation summary={summary} />);

    expect(screen.getByText("Tu disponible de hoy se calculó protegiendo:")).toBeInTheDocument();
    expect(screen.getByText("Renta")).toBeInTheDocument();
    expect(screen.getByText("Tarjeta BBVA")).toBeInTheDocument();
    expect(screen.getByText("Meta Viaje")).toBeInTheDocument();
    expect(screen.getByText("$8,500")).toBeInTheDocument();
    expect(screen.getByText("$4,200")).toBeInTheDocument();
    expect(screen.getByText("$1,800")).toBeInTheDocument();
  });

  it("no truena sin tarjetas/metas", () => {
    render(<SafeToSpendExplanation summary={{ ...summary, upcomingObligations: [], spendingPower: { ...summary.spendingPower, protectedForObligations: 0 } }} />);

    expect(screen.getByText("No hay pagos o metas reduciendo tu disponible de hoy.")).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FinancialStreakCard } from "@/components/dashboard/FinancialStreakCard";
import type { DashboardSummary } from "@/types/dashboard";

function summary(currentStreakDays: number): DashboardSummary {
  return {
    month: "2026-05",
    balance: {
      current: 1000,
      projectedEndOfMonth: 4000,
      status: "healthy",
      message: "Vas bien.",
    },
    spendingPower: {
      safeToSpendToday: 727,
      recommendedDailySpend: 727,
      remainingVariableBudget: 8724,
    },
    income: {
      expected: 20000,
      received: 10000,
      pending: 10000,
    },
    expenses: {
      spent: 400,
      fixedPending: 0,
      variableSpent: 400,
    },
    budget: {
      monthlyBudget: 8880,
      used: 400,
      usedPercentage: 5,
    },
    upcomingObligations: [],
    insights: [],
    categoriesToWatch: [],
    recentMovements: [],
    habit: {
      currentStreakDays,
      registrationCoveragePercentage: 10,
      message: "Registro activo.",
    },
  };
}

describe("FinancialStreakCard", () => {
  it("invita a iniciar la racha cuando currentStreakDays es 0", () => {
    render(<FinancialStreakCard summary={summary(0)} />);

    expect(screen.getByText("Empieza hoy")).toBeInTheDocument();
    expect(screen.getAllByText("Registra un movimiento para iniciar tu racha.").length).toBeGreaterThan(0);
  });

  it("muestra progreso sobrio cuando hay racha activa", () => {
    render(<FinancialStreakCard summary={summary(5)} />);

    expect(screen.getByText("5 días")).toBeInTheDocument();
    expect(screen.getAllByText("Vas construyendo claridad.").length).toBeGreaterThan(0);
  });
});

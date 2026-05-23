import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { FinancialStatusHero } from "@/components/dashboard/FinancialStatusHero";
import type { DashboardSummary } from "@/types/dashboard";

function summary(overrides: Partial<DashboardSummary> = {}): DashboardSummary {
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
    dailyEnvelope: {
      date: "2026-05-20",
      startingDailyAllowance: 740,
      spentToday: 400,
      remainingToday: 340,
      isOverDailyAllowance: false,
      overspentToday: 0,
      nextDaysDailyAllowanceBeforeTodaySpending: 740,
      nextDaysDailyAllowanceAfterTodaySpending: 727,
      nextDaysDailyAllowanceDelta: -13,
      message: "Te quedan $340 para hoy. Tu margen diario desde mañana será de $727.",
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
      currentStreakDays: 1,
      registrationCoveragePercentage: 10,
      message: "Registro activo.",
    },
    ...overrides,
  };
}

function renderHero(data: DashboardSummary) {
  render(
    <MemoryRouter>
      <FinancialStatusHero summary={data} />
    </MemoryRouter>,
  );
}

describe("FinancialStatusHero daily envelope", () => {
  it("muestra Hoy te quedan y el remainingToday como protagonista", () => {
    renderHero(summary());

    expect(screen.getByText("Hoy te quedan")).toBeInTheDocument();
    expect(screen.getAllByText("$340").length).toBeGreaterThan(0);
    expect(screen.getByText("de tu margen diario de $740.")).toBeInTheDocument();
  });

  it("muestra margen agotado cuando remainingToday es 0 sin exceso", () => {
    renderHero(summary({
      dailyEnvelope: {
        date: "2026-05-20",
        startingDailyAllowance: 740,
        spentToday: 740,
        remainingToday: 0,
        isOverDailyAllowance: false,
        overspentToday: 0,
        nextDaysDailyAllowanceBeforeTodaySpending: 740,
        nextDaysDailyAllowanceAfterTodaySpending: 740,
        nextDaysDailyAllowanceDelta: 0,
        message: "Ya usaste tu margen de hoy. Si no gastas más, mantienes estable tu proyección.",
      },
    }));

    expect(screen.getByText("Ya usaste tu margen de hoy")).toBeInTheDocument();
    expect(screen.getByText("evita más gastos para mantener tu proyección.")).toBeInTheDocument();
  });

  it("muestra exceso cuando overspentToday es mayor a 0", () => {
    renderHero(summary({
      dailyEnvelope: {
        date: "2026-05-20",
        startingDailyAllowance: 740,
        spentToday: 900,
        remainingToday: 0,
        isOverDailyAllowance: true,
        overspentToday: 160,
        nextDaysDailyAllowanceBeforeTodaySpending: 740,
        nextDaysDailyAllowanceAfterTodaySpending: 725.45,
        nextDaysDailyAllowanceDelta: -14.55,
        message: "Te pasaste por $160 hoy. Tu margen diario desde mañana baja a $725.",
      },
    }));

    expect(screen.getByText("Te pasaste hoy por")).toBeInTheDocument();
    expect(screen.getAllByText("$160").length).toBeGreaterThan(0);
    expect(screen.getByText("tu día necesita ajuste.")).toBeInTheDocument();
  });

  it("muestra el breakdown del margen diario", () => {
    renderHero(summary());

    expect(screen.getByText("Margen inicial")).toBeInTheDocument();
    expect(screen.getByText("Gastado hoy")).toBeInTheDocument();
    expect(screen.getByText("Restante hoy")).toBeInTheDocument();
    expect(screen.getAllByText("Desde mañana").length).toBeGreaterThan(0);
  });

  it("no truena si dailyEnvelope viene undefined temporalmente", () => {
    const data = { ...summary(), dailyEnvelope: undefined };

    renderHero(data);

    expect(screen.getByText("Hoy puedes gastar")).toBeInTheDocument();
    expect(screen.getAllByText("$727").length).toBeGreaterThan(0);
  });
});

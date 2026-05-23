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
  it("muestra Hoy puedes gastar cuando spentToday es 0", () => {
    renderHero(summary({
      dailyEnvelope: {
        date: "2026-05-20",
        startingDailyAllowance: 740,
        spentToday: 0,
        remainingToday: 740,
        isOverDailyAllowance: false,
        overspentToday: 0,
        nextDaysDailyAllowanceBeforeTodaySpending: 740,
        nextDaysDailyAllowanceAfterTodaySpending: 740,
        nextDaysDailyAllowanceDelta: 0,
        message: "Te quedan $740 para hoy.",
      },
    }));

    expect(screen.getByText("Hoy puedes gastar")).toBeInTheDocument();
    expect(screen.getAllByText("$740").length).toBeGreaterThan(0);
    expect(screen.getByText("Tu margen diario está completo.")).toBeInTheDocument();
    expect(screen.getByText("Si mantienes este ritmo, cerrarás el periodo con $4,000.")).toBeInTheDocument();
    expect(screen.getByText("Tu margen está completo para hoy.")).toBeInTheDocument();
    expect(screen.queryByText("de tu margen diario de $740.")).not.toBeInTheDocument();
  });

  it("muestra Hoy te quedan y el remainingToday como protagonista", () => {
    renderHero(summary());

    expect(screen.getByText("Hoy te quedan")).toBeInTheDocument();
    expect(screen.getAllByText("$340").length).toBeGreaterThan(0);
    expect(screen.getByText("Has usado $400 de tu margen diario de $740.")).toBeInTheDocument();
    expect(screen.getByText("Desde mañana tu margen será de $727 por día.")).toBeInTheDocument();
    expect(screen.getByText("Te quedan $340 para hoy.")).toBeInTheDocument();
  });

  it("usa remainingToday como monto principal aunque safeToSpendToday tenga el promedio futuro", () => {
    renderHero(summary({
      spendingPower: {
        safeToSpendToday: 794,
        recommendedDailySpend: 794,
        remainingVariableBudget: 9528,
      },
      dailyEnvelope: {
        date: "2026-05-20",
        startingDailyAllowance: 808,
        spentToday: 122,
        remainingToday: 686,
        isOverDailyAllowance: false,
        overspentToday: 0,
        nextDaysDailyAllowanceBeforeTodaySpending: 808,
        nextDaysDailyAllowanceAfterTodaySpending: 794,
        nextDaysDailyAllowanceDelta: -14,
        message: "Te quedan $686 para hoy. Tu margen diario desde mañana será de $794.",
      },
    }));

    expect(screen.getByText("Hoy te quedan")).toBeInTheDocument();
    expect(screen.getAllByText("$686").length).toBeGreaterThan(0);
    expect(screen.getByText("Has usado $122 de tu margen diario de $808.")).toBeInTheDocument();
    expect(screen.getByText("$794 / día")).toBeInTheDocument();
    expect(screen.queryByText("Hoy puedes gastar")).not.toBeInTheDocument();
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
    expect(screen.getByText("Si no gastas más hoy, mantienes estable tu proyección.")).toBeInTheDocument();
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
    expect(screen.getByText("Tu margen diario desde mañana será de $725.")).toBeInTheDocument();
    expect(screen.getByText("Cada gasto extra de hoy reduce tu margen de los próximos días.")).toBeInTheDocument();
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

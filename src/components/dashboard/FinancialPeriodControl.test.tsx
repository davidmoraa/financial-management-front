import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { useMemo, useState } from "react";
import { describe, expect, it } from "vitest";
import { FinancialPeriodControl } from "@/components/dashboard/FinancialPeriodControl";
import { getDashboardPeriod } from "@/lib/dashboard/dashboardPeriod";
import type { DashboardPeriodType, DashboardSummary } from "@/types/dashboard";

const currentDate = new Date("2026-05-21T12:00:00.000Z");

function summary(overrides: Partial<DashboardSummary> = {}): DashboardSummary {
  return {
    month: "2026-05",
    balance: {
      current: 0,
      projectedEndOfMonth: 0,
      status: "healthy",
      message: "Vas bien este mes.",
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
    ...overrides,
  };
}

function ControlledFinancialPeriodControl({ initial = "monthly", data }: { initial?: DashboardPeriodType; data?: DashboardSummary }) {
  const [value, setValue] = useState<DashboardPeriodType>(initial);
  const period = useMemo(() => getDashboardPeriod(value, currentDate), [value]);

  return (
    <MemoryRouter>
      <FinancialPeriodControl
        currentDate={currentDate}
        value={value}
        period={period}
        onChange={setValue}
        summary={data}
      />
    </MemoryRouter>
  );
}

describe("FinancialPeriodControl", () => {
  it("renderiza el periodo activo real y rango mensual", () => {
    render(<ControlledFinancialPeriodControl />);

    expect(screen.getByText("Analizando")).toBeInTheDocument();
    expect(screen.getByText("mayo 2026")).toBeInTheDocument();
    expect(screen.getByText(/Vista mensual · 1 mayo - 31 mayo/i)).toBeInTheDocument();
  });

  it("cambia visualmente entre Mes, Quincena y Semana", async () => {
    const user = userEvent.setup();
    render(<ControlledFinancialPeriodControl />);

    await user.click(screen.getByRole("button", { name: "Semana" }));

    expect(screen.getByRole("button", { name: "Semana" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/Vista semanal/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Quincena" }));

    expect(screen.getByRole("button", { name: "Quincena" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/Vista quincenal/i)).toBeInTheDocument();
  });

  it("muestra micro CTA cuando no hay registro de hoy o faltan datos opcionales", () => {
    render(<ControlledFinancialPeriodControl />);

    expect(screen.getByRole("link", { name: /registra hoy para mejorar tu proyección/i })).toHaveAttribute("href", "/new");
  });

  it("muestra estado actualizado cuando existe movimiento hoy", () => {
    render(
      <ControlledFinancialPeriodControl
        data={summary({
          recentMovements: [
            {
              id: "tx-1",
              description: "Café",
              categoryName: "Comida",
              amount: 80,
              type: "expense",
              date: "2026-05-21",
            },
          ],
        })}
      />,
    );

    expect(screen.getByText("Actualizado con tus registros de hoy")).toBeInTheDocument();
  });
});

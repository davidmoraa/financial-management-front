import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { DashboardPage } from "@/pages/DashboardPage";
import { fetchDashboardSummary } from "@/services/dashboardApi";
import type { DashboardSummary } from "@/types/dashboard";

vi.mock("@/services/dashboardApi", () => ({
  fetchDashboardSummary: vi.fn(),
}));

const fetchDashboardSummaryMock = vi.mocked(fetchDashboardSummary);

function dashboardSummary(overrides: Partial<DashboardSummary> = {}): DashboardSummary {
  return {
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

describe("DashboardPage", () => {
  it("muestra empty state real cuando la API no devuelve datos", async () => {
    fetchDashboardSummaryMock.mockResolvedValueOnce(dashboardSummary());

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Aún no tienes movimientos registrados.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /registrar primer movimiento/i })).toBeInTheDocument();
  });

  it("muestra gastos fijos pendientes desde el summary real de API", async () => {
    fetchDashboardSummaryMock.mockResolvedValueOnce(
      dashboardSummary({
        income: {
          expected: 10000,
          received: 0,
          pending: 10000,
        },
        expenses: {
          spent: 0,
          fixedPending: 599,
          variableSpent: 0,
        },
        budget: {
          monthlyBudget: 15000,
          used: 0,
          usedPercentage: 0,
        },
        spendingPower: {
          safeToSpendToday: 450,
          recommendedDailySpend: 450,
          remainingVariableBudget: 14401,
        },
        balance: {
          current: 0,
          projectedEndOfMonth: 9401,
          status: "healthy",
          message: "Vas bien este mes.",
        },
        nextFixedExpense: {
          id: "fixed-1",
          name: "Internet",
          amount: 599,
          dueDate: "2026-05-25",
          daysLeft: 5,
        },
      }),
    );

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Internet")).toBeInTheDocument();
    expect(screen.getAllByText(/pendientes/i).length).toBeGreaterThan(0);
  });

  it("muestra estado de error cuando falla el summary de API", async () => {
    fetchDashboardSummaryMock.mockRejectedValueOnce(new Error("API down"));

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("No pudimos cargar tu resumen financiero")).toBeInTheDocument();
  });

  it("muestra acción recomendada e insights secundarios del summary real", async () => {
    fetchDashboardSummaryMock.mockResolvedValueOnce(
      dashboardSummary({
        balance: {
          current: 9000,
          projectedEndOfMonth: 7000,
          status: "healthy",
          message: "Vas bien este mes.",
        },
        income: {
          expected: 10000,
          received: 10000,
          pending: 0,
        },
        expenses: {
          spent: 1000,
          fixedPending: 0,
          variableSpent: 1000,
        },
        budget: {
          monthlyBudget: 5000,
          used: 1000,
          usedPercentage: 20,
        },
        spendingPower: {
          safeToSpendToday: 300,
          recommendedDailySpend: 300,
          remainingVariableBudget: 4000,
        },
        recommendedAction: {
          type: "adjust_budget",
          title: "Riesgo de flujo",
          description: "Tu proyección indica que podrías cerrar el mes en negativo.",
          ctaLabel: "Revisar plan del mes",
          targetPath: "/",
          priority: "high",
        },
        insights: [
          {
            id: "cashflow-risk",
            type: "cashflow_risk",
            severity: "danger",
            title: "Riesgo de flujo",
            description: "Tu proyección indica que podrías cerrar el mes en negativo.",
            ctaLabel: "Revisar plan del mes",
            targetPath: "/",
            priority: 1,
          },
          {
            id: "budget-exceeded",
            type: "budget_exceeded",
            severity: "danger",
            title: "Presupuesto superado",
            description: "Ya superaste tu presupuesto mensual.",
            priority: 2,
          },
          {
            id: "uncategorized",
            type: "uncategorized_movements",
            severity: "warning",
            title: "Movimientos sin categoría",
            description: "Tienes 2 movimientos sin categorizar.",
            priority: 3,
          },
          {
            id: "daily-limit",
            type: "daily_spending_limit",
            severity: "info",
            title: "Gasto seguro para hoy",
            description: "Puedes gastar hasta $300 hoy.",
            priority: 6,
          },
          {
            id: "healthy",
            type: "healthy_month",
            severity: "positive",
            title: "Mes estable",
            description: "Tu mes se ve estable.",
            priority: 9,
          },
        ],
        recentMovements: [
          {
            id: "tx-1",
            description: "Comida",
            categoryName: "Comida",
            amount: 1000,
            type: "expense",
            date: "2026-05-20",
          },
        ],
      }),
    );

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Riesgo de flujo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /revisar plan del mes/i })).toBeInTheDocument();
    expect(screen.getByText("Presupuesto superado")).toBeInTheDocument();
    expect(screen.getByText("Movimientos sin categoría")).toBeInTheDocument();
    expect(screen.getByText("Gasto seguro para hoy")).toBeInTheDocument();
    expect(screen.queryByText("Mes estable")).not.toBeInTheDocument();
  });
});

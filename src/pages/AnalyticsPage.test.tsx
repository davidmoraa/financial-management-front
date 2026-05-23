import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import type { AnalyticsSummary } from "@/types/analytics";

const analyticsApiMock = vi.hoisted(() => ({
  fetchAnalyticsSummary: vi.fn(),
}));

vi.mock("@/services/analyticsApi", () => analyticsApiMock);

function analyticsSummary(overrides: Partial<AnalyticsSummary> = {}): AnalyticsSummary {
  return {
    period: "2026-05",
    overview: {
      income: 0,
      expenses: 0,
      netSavings: 0,
      projectedEndOfPeriod: 0,
      savingsRate: 0,
    },
    spendingByCategory: [],
    categoryBudgetProgress: [],
    spendingPace: {
      expectedUsagePercentage: 0,
      actualUsagePercentage: 0,
      status: "on_pace",
      message: "Registra movimientos para medir tu ritmo.",
    },
    cashflowProjection: [],
    fixedVsVariable: {
      fixedExpenses: 0,
      variableExpenses: 0,
      savingsGoals: 0,
      creditCardObligations: 0,
    },
    upcomingObligations: [],
    dailyHeatmap: [],
    monthlyTrend: [],
    moneyLeaks: [],
    savingsMilestones: [],
    creditCards: [],
    insights: [],
    ...overrides,
  };
}

describe("AnalyticsPage", () => {
  beforeEach(() => {
    analyticsApiMock.fetchAnalyticsSummary.mockReset();
  });

  it("renderiza estado de carga", () => {
    analyticsApiMock.fetchAnalyticsSummary.mockReturnValueOnce(new Promise<AnalyticsSummary>(() => undefined));

    render(
      <MemoryRouter>
        <AnalyticsPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("status", { name: "Cargando análisis financiero" })).toBeInTheDocument();
  });

  it("renderiza estado vacío sin datos", async () => {
    analyticsApiMock.fetchAnalyticsSummary.mockResolvedValueOnce(analyticsSummary());

    render(
      <MemoryRouter>
        <AnalyticsPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Aún no hay suficientes datos para analizar.")).toBeInTheDocument();
    expect(screen.getByText("Aún no hay gastos para comparar categorías.")).toBeInTheDocument();
    expect(screen.getByText("No tienes tarjetas activas para analizar.")).toBeInTheDocument();
    expect(screen.getByText("Todavía no tienes metas activas.")).toBeInTheDocument();
  });

  it("renderiza categorías, barras de presupuesto e insights reales", async () => {
    analyticsApiMock.fetchAnalyticsSummary.mockResolvedValueOnce(
      analyticsSummary({
        overview: {
          income: 20000,
          expenses: 12000,
          netSavings: 8000,
          projectedEndOfPeriod: 6500,
          savingsRate: 40,
        },
        spendingByCategory: [
          {
            categoryId: "food",
            categoryName: "Comida",
            amount: 6000,
            percentage: 50,
          },
          {
            categoryId: "transport",
            categoryName: "Transporte",
            amount: 3000,
            percentage: 25,
          },
        ],
        categoryBudgetProgress: [
          {
            categoryId: "food",
            categoryName: "Comida",
            spent: 6000,
            budget: 6000,
            percentage: 100,
            status: "danger",
          },
          {
            categoryId: "transport",
            categoryName: "Transporte",
            spent: 3000,
            budget: 4000,
            percentage: 75,
            status: "healthy",
          },
        ],
        spendingPace: {
          expectedUsagePercentage: 55,
          actualUsagePercentage: 80,
          status: "over_pace",
          message: "Vas acelerado frente al ritmo esperado.",
        },
        insights: [
          {
            id: "category-food",
            severity: "warning",
            title: "Comida concentra mucho gasto",
            description: "Comida representa 50% de tus gastos del periodo.",
            suggestedAction: "Revisar categoría",
            targetPath: "/categories",
          },
        ],
      }),
    );

    render(
      <MemoryRouter>
        <AnalyticsPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Comida concentra mucho gasto")).toBeInTheDocument();
    expect(screen.getAllByText("Comida").length).toBeGreaterThan(0);
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("Vas acelerado frente al ritmo esperado.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Revisar categoría" })).toHaveAttribute("href", "/categories");
  });

  it("renderiza estado de error", async () => {
    analyticsApiMock.fetchAnalyticsSummary.mockRejectedValueOnce(new Error("API down"));

    render(
      <MemoryRouter>
        <AnalyticsPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("No pudimos cargar tu análisis")).toBeInTheDocument();
  });
});

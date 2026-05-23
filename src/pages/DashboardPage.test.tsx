import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const dashboardApiMock = vi.hoisted(() => ({
  fetchDashboardSummary: vi.fn(),
}));

const creditCardsApiMock = vi.hoisted(() => ({
  fetchCreditCardObligations: vi.fn(),
}));

const savingMilestonesApiMock = vi.hoisted(() => ({
  fetchSavingMilestones: vi.fn(),
}));

vi.mock("@/services/dashboardApi", () => dashboardApiMock);

vi.mock("@/services/creditCardsApi", () => creditCardsApiMock);

vi.mock("@/services/savingMilestonesApi", () => savingMilestonesApiMock);

vi.mock("@/lib/dashboard/localDashboardSummary", () => ({
  buildLocalDashboardSummary: vi.fn(async (_month: string, options: { remoteSummary?: DashboardSummary }) => options.remoteSummary),
}));

import { DashboardPage } from "@/pages/DashboardPage";
import type { DashboardSummary } from "@/types/dashboard";

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

describe("DashboardPage", () => {
  beforeEach(() => {
    dashboardApiMock.fetchDashboardSummary.mockReset();
    creditCardsApiMock.fetchCreditCardObligations.mockReset();
    savingMilestonesApiMock.fetchSavingMilestones.mockReset();
    creditCardsApiMock.fetchCreditCardObligations.mockResolvedValue([]);
    savingMilestonesApiMock.fetchSavingMilestones.mockResolvedValue([]);
  });

  it("muestra loading state mientras carga el summary", () => {
    dashboardApiMock.fetchDashboardSummary.mockReturnValueOnce(new Promise<DashboardSummary>(() => undefined));

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Preparando tu lectura financiera...")).toBeInTheDocument();
  });

  it("muestra empty state real cuando la API no devuelve datos", async () => {
    dashboardApiMock.fetchDashboardSummary.mockResolvedValueOnce(dashboardSummary());

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Aún no tienes movimientos registrados.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /registrar primer movimiento/i })).toBeInTheDocument();
  });

  it("muestra gastos fijos pendientes desde el summary real de API", async () => {
    dashboardApiMock.fetchDashboardSummary.mockResolvedValueOnce(
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
    dashboardApiMock.fetchDashboardSummary.mockRejectedValueOnce(new Error("API down"));

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("No pudimos cargar tu resumen financiero")).toBeInTheDocument();
  });

  it("muestra acción recomendada e insights secundarios del summary real", async () => {
    dashboardApiMock.fetchDashboardSummary.mockResolvedValueOnce(
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
    expect(screen.getByRole("link", { name: /revisar plan del mes/i })).toHaveAttribute("href", "/");
    expect(screen.getByText("Presupuesto superado")).toBeInTheDocument();
    expect(screen.getByText("Movimientos sin categoría")).toBeInTheDocument();
    expect(screen.getByText("Gasto seguro para hoy")).toBeInTheDocument();
    expect(screen.queryByText("Mes estable")).not.toBeInTheDocument();
  });

  it("renderiza un dashboard saludable con datos reales", async () => {
    dashboardApiMock.fetchDashboardSummary.mockResolvedValueOnce(
      dashboardSummary({
        balance: {
          current: 7000,
          projectedEndOfMonth: 9000,
          status: "healthy",
          message: "Vas bien este mes.",
        },
        income: {
          expected: 10000,
          received: 10000,
          pending: 0,
        },
        expenses: {
          spent: 3000,
          fixedPending: 0,
          variableSpent: 3000,
        },
        budget: {
          monthlyBudget: 12000,
          used: 3000,
          usedPercentage: 25,
        },
        spendingPower: {
          safeToSpendToday: 600,
          recommendedDailySpend: 600,
          remainingVariableBudget: 9000,
        },
      }),
    );

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Hoy puedes gastar")).toBeInTheDocument();
    expect(screen.getAllByText("$600").length).toBeGreaterThan(0);
    expect(screen.getByText("con calma, sin salirte del plan.")).toBeInTheDocument();
    expect(screen.getByText("Mes saludable")).toBeInTheDocument();
    expect(screen.getByText("Registra hoy para mejorar tu proyección")).toBeInTheDocument();
    expect(screen.queryByText("Periodo activo")).not.toBeInTheDocument();
    expect(screen.queryByText("Vista del dashboard")).not.toBeInTheDocument();
  });

  it("renderiza estado warning con copy preventivo", async () => {
    dashboardApiMock.fetchDashboardSummary.mockResolvedValueOnce(
      dashboardSummary({
        balance: {
          current: 2500,
          projectedEndOfMonth: 1200,
          status: "warning",
          message: "Cuida el ritmo de gastos.",
        },
        income: {
          expected: 10000,
          received: 8000,
          pending: 2000,
        },
        expenses: {
          spent: 7200,
          fixedPending: 800,
          variableSpent: 6400,
        },
        budget: {
          monthlyBudget: 8000,
          used: 7200,
          usedPercentage: 90,
        },
        spendingPower: {
          safeToSpendToday: 180,
          recommendedDailySpend: 180,
          remainingVariableBudget: 800,
        },
      }),
    );

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Atención")).toBeInTheDocument();
    expect(screen.getByText("para mantener el mes estable.")).toBeInTheDocument();
  });

  it("renderiza estado risk sin romper el hero", async () => {
    dashboardApiMock.fetchDashboardSummary.mockResolvedValueOnce(
      dashboardSummary({
        balance: {
          current: -2000,
          projectedEndOfMonth: -1200,
          status: "risk",
          message: "Tu proyección indica que podrías cerrar en negativo.",
        },
        income: {
          expected: 10000,
          received: 8000,
          pending: 2000,
        },
        expenses: {
          spent: 11200,
          fixedPending: 0,
          variableSpent: 11200,
        },
        budget: {
          monthlyBudget: 10000,
          used: 11200,
          usedPercentage: 112,
        },
        spendingPower: {
          safeToSpendToday: 0,
          recommendedDailySpend: 0,
          remainingVariableBudget: 0,
        },
      }),
    );

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Riesgo")).toBeInTheDocument();
    expect(screen.getByText("tu mes necesita atención.")).toBeInTheDocument();
  });

  it("coloca la acción recomendada inmediatamente después del hero antes del pulso financiero", async () => {
    dashboardApiMock.fetchDashboardSummary.mockResolvedValueOnce(
      dashboardSummary({
        balance: {
          current: 7000,
          projectedEndOfMonth: 9000,
          status: "healthy",
          message: "Vas bien este mes.",
        },
        income: {
          expected: 10000,
          received: 10000,
          pending: 0,
        },
        expenses: {
          spent: 3000,
          fixedPending: 0,
          variableSpent: 3000,
        },
        budget: {
          monthlyBudget: 12000,
          used: 3000,
          usedPercentage: 25,
        },
        spendingPower: {
          safeToSpendToday: 600,
          recommendedDailySpend: 600,
          remainingVariableBudget: 9000,
        },
      }),
    );

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    const hero = await screen.findByText("Hoy puedes gastar");
    const action = screen.getByText("Acción recomendada");
    const pulse = screen.getByText("Pulso financiero");

    expect(hero.compareDocumentPosition(action) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(action.compareDocumentPosition(pulse) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("no truena cuando no hay recientes, categorías o próximo gasto fijo", async () => {
    dashboardApiMock.fetchDashboardSummary.mockResolvedValueOnce(
      dashboardSummary({
        balance: {
          current: 5000,
          projectedEndOfMonth: 5000,
          status: "healthy",
          message: "Vas bien este mes.",
        },
        income: {
          expected: 5000,
          received: 5000,
          pending: 0,
        },
        budget: {
          monthlyBudget: 5000,
          used: 0,
          usedPercentage: 0,
        },
        spendingPower: {
          safeToSpendToday: 300,
          recommendedDailySpend: 300,
          remainingVariableBudget: 5000,
        },
        categoriesToWatch: [],
        nextFixedExpense: undefined,
        recentMovements: [],
      }),
    );

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("No hay pagos fijos pendientes este mes.")).toBeInTheDocument();
    expect(screen.getByText("Sin categorías en alerta.")).toBeInTheDocument();
    expect(screen.getByText("Aún no hay movimientos")).toBeInTheDocument();
  });

  it("renderiza compromisos próximos de tarjeta y estado próximo", async () => {
    dashboardApiMock.fetchDashboardSummary.mockResolvedValueOnce(
      dashboardSummary({
        balance: {
          current: 7000,
          projectedEndOfMonth: 9000,
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
          monthlyBudget: 12000,
          used: 1000,
          usedPercentage: 8,
        },
        spendingPower: {
          safeToSpendToday: 600,
          recommendedDailySpend: 600,
          remainingVariableBudget: 9000,
          protectedForObligations: 1250,
          protectedForCreditCards: 1250,
          protectedForSavings: 0,
        },
        upcomingObligations: [
          {
            id: "credit-card-statement:card-1:2026-04-19:2026-05-18",
            source: "credit_card_statement",
            name: "Nu",
            amount: 1250,
            dueDate: "2026-06-08",
            priority: "essential",
            status: "due_soon",
          },
        ],
      }),
    );

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Compromisos próximos")).toBeInTheDocument();
    expect(screen.getAllByText("Nu").length).toBeGreaterThan(0);
    expect(screen.getByText("Próximo")).toBeInTheDocument();
    expect(screen.getAllByText("$1,250").length).toBeGreaterThan(0);
  });

  it("renderiza metas activas con progreso y aportación sugerida", async () => {
    dashboardApiMock.fetchDashboardSummary.mockResolvedValueOnce(
      dashboardSummary({
        balance: {
          current: 7000,
          projectedEndOfMonth: 9000,
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
          monthlyBudget: 12000,
          used: 1000,
          usedPercentage: 8,
        },
        spendingPower: {
          safeToSpendToday: 600,
          recommendedDailySpend: 600,
          remainingVariableBudget: 9000,
        },
      }),
    );
    savingMilestonesApiMock.fetchSavingMilestones.mockResolvedValueOnce([
      {
        id: "goal-1",
        name: "Viaje",
        targetAmount: 20000,
        currentAmount: 5000,
        targetDate: "2026-12-31",
        priority: "important",
        contributionFrequency: "weekly",
        autoReserve: true,
        isActive: true,
        createdAt: "2026-05-22T00:00:00.000Z",
        updatedAt: "2026-05-22T00:00:00.000Z",
        projection: {
          remainingAmount: 15000,
          daysRemaining: 223,
          weeksRemaining: 32,
          monthsRemaining: 8,
          requiredDailyContribution: 67.26,
          requiredWeeklyContribution: 468.75,
          requiredBiweeklyContribution: 937.5,
          requiredMonthlyContribution: 1875,
          progressPercentage: 25,
          health: "on_track",
        },
      },
    ]);

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Metas activas")).toBeInTheDocument();
    expect(screen.getByText("Viaje")).toBeInTheDocument();
    expect(screen.getByText(/por semana/i)).toBeInTheDocument();
  });
});

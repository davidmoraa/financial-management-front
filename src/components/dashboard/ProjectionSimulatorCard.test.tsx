import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProjectionSimulatorCard } from "@/components/dashboard/ProjectionSimulatorCard";
import type { DashboardSummary } from "@/types/dashboard";

const projectionsApiMock = vi.hoisted(() => ({
  simulateProjection: vi.fn(),
}));

vi.mock("@/services/projectionsApi", () => projectionsApiMock);

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
  },
  income: {
    expected: 20000,
    received: 10000,
    pending: 10000,
  },
  expenses: {
    spent: 3000,
    fixedPending: 0,
    variableSpent: 3000,
  },
  budget: {
    monthlyBudget: 20000,
    used: 3000,
    usedPercentage: 15,
  },
  upcomingObligations: [
    {
      id: "credit-card-statement:44444444-4444-4444-8444-444444444444:2026-04-19:2026-05-18",
      source: "credit_card_statement",
      name: "Tarjeta BBVA",
      amount: 4200,
      dueDate: "2026-05-28",
      priority: "essential",
      status: "due_soon",
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

describe("ProjectionSimulatorCard", () => {
  it("simulador muestra before/after", async () => {
    projectionsApiMock.simulateProjection.mockResolvedValueOnce({
      safeToSpendTodayBefore: 430,
      safeToSpendTodayAfter: 320,
      projectedEndOfMonthBefore: 1000,
      projectedEndOfMonthAfter: 0,
      explanation: "Puedes hacerlo, pero reduciría tu margen diario a $320.",
    });
    const user = userEvent.setup();

    render(<ProjectionSimulatorCard currentDate={new Date("2026-05-20T12:00:00.000Z")} summary={summary} />);
    await user.click(screen.getByRole("button", { name: /qué pasa si gasto \$1,000/i }));

    expect(await screen.findByText("Puedes hacerlo, pero reduciría tu margen diario a $320.")).toBeInTheDocument();
    expect(screen.getByText("Antes $430")).toBeInTheDocument();
    expect(screen.getByText("$320")).toBeInTheDocument();
  });

  it("insight de corte de tarjeta renderiza fecha correcta", async () => {
    projectionsApiMock.simulateProjection.mockResolvedValueOnce({
      safeToSpendTodayBefore: 430,
      safeToSpendTodayAfter: 430,
      projectedEndOfMonthBefore: 1000,
      projectedEndOfMonthAfter: 1000,
      explanation: "Esta compra con BBVA se pagaría hasta el 2026-07-08.",
      creditCardPurchase: {
        creditCardId: "44444444-4444-4444-8444-444444444444",
        creditCardName: "BBVA",
        statementStartDate: "2026-05-19",
        statementEndDate: "2026-06-18",
        paymentDueDate: "2026-07-08",
        appliesToCurrentPeriod: false,
      },
    });
    const user = userEvent.setup();

    render(<ProjectionSimulatorCard currentDate={new Date("2026-05-20T12:00:00.000Z")} summary={summary} />);
    await user.click(screen.getByRole("button", { name: /qué pasa si compro con tarjeta/i }));

    expect(await screen.findByText(/se pagaría el 8 jul 2026/i)).toBeInTheDocument();
  });

  it("no truena sin tarjetas/metas", () => {
    render(<ProjectionSimulatorCard currentDate={new Date("2026-05-20T12:00:00.000Z")} summary={{ ...summary, upcomingObligations: [] }} />);

    expect(screen.getByRole("button", { name: /qué pasa si gasto \$1,000/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /qué pasa si compro con tarjeta/i })).not.toBeInTheDocument();
  });
});

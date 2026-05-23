import { describe, expect, it, vi } from "vitest";
import { fetchAnalyticsSummary } from "@/services/analyticsApi";
import type { AnalyticsSummaryResponse } from "@/types/analytics";

function response(): AnalyticsSummaryResponse {
  return {
    summary: {
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
    },
  };
}

describe("analyticsApi", () => {
  it("envía periodo y zona horaria al summary de analytics", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(response()), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions").mockReturnValue({
      calendar: "gregory",
      locale: "es-MX",
      numberingSystem: "latn",
      timeZone: "America/Mazatlan",
    });

    await fetchAnalyticsSummary("2026-05");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/v1/analytics/summary?period=2026-05&timeZone=America%2FMazatlan",
      expect.any(Object),
    );
  });
});

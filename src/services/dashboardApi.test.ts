import { describe, expect, it, vi } from "vitest";
import { fetchDashboardSummary } from "@/services/dashboardApi";
import type { DashboardSummaryResponse } from "@/types/dashboard";

function response(): DashboardSummaryResponse {
  return {
    summary: {
      month: "2026-05",
      balance: {
        current: 0,
        projectedEndOfMonth: 0,
        status: "healthy",
        message: "Vas bien.",
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
        message: "Registro activo.",
      },
    },
  };
}

describe("dashboardApi", () => {
  it("envía la zona horaria del navegador al resumen del dashboard", async () => {
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

    await fetchDashboardSummary("2026-05");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3000/v1/dashboard/summary?month=2026-05&timeZone=America%2FMazatlan",
      expect.any(Object),
    );
  });
});

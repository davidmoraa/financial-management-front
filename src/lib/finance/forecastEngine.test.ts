import { describe, expect, it } from "vitest";
import { getMonthlyForecast } from "@/lib/finance/forecastEngine";
import type { Transaction } from "@/types/finance";
import type { FixedExpense, FixedExpenseOccurrence } from "@/types/fixedExpenses";

const fixedExpense: FixedExpense = {
  id: "fixed-1",
  name: "Renta",
  amount: 8500,
  categoryId: "home",
  categoryName: "Casa",
  paymentMethod: "transfer",
  recurrence: "monthly",
  paymentWindowStartDay: 1,
  paymentWindowEndDay: 5,
  activeFromMonth: "2026-05-01",
  includeInForecast: true,
  isActive: true,
  syncStatus: "synced",
  clientCreatedAt: "2026-05-01T00:00:00.000Z",
  clientUpdatedAt: "2026-05-01T00:00:00.000Z",
  createdAt: "2026-05-01T00:00:00.000Z",
  updatedAt: "2026-05-01T00:00:00.000Z",
};

const variableExpense: Transaction = {
  id: "tx-variable",
  type: "expense",
  amount: 500,
  categoryId: "food",
  categoryName: "Comida",
  paymentMethod: "cash",
  transactionDate: "2026-05-03",
  syncStatus: "synced",
  clientCreatedAt: "2026-05-03T00:00:00.000Z",
  clientUpdatedAt: "2026-05-03T00:00:00.000Z",
  createdAt: "2026-05-03T00:00:00.000Z",
  updatedAt: "2026-05-03T00:00:00.000Z",
};

describe("forecastEngine", () => {
  it("no cuenta fixed expense pendiente como gasto real pero sí como proyección", () => {
    const forecast = getMonthlyForecast({
      transactions: [variableExpense],
      fixedExpenses: [fixedExpense],
      fixedExpenseOccurrences: [],
      monthlyBudget: 15000,
      targetMonth: new Date("2026-05-01T00:00:00"),
      today: new Date("2026-05-03T00:00:00"),
    });

    expect(forecast.actualExpenses).toBe(500);
    expect(forecast.pendingFixedExpenses).toBe(8500);
    expect(forecast.projectedMonthEndExpenses).toBeGreaterThan(8500);
  });

  it("evita doble conteo cuando está pagado", () => {
    const paidTransaction: Transaction = {
      ...variableExpense,
      id: "tx-fixed",
      amount: 8500,
      fixedExpenseId: fixedExpense.id,
      fixedExpenseOccurrenceId: "occ-1",
    };
    const occurrence: FixedExpenseOccurrence = {
      id: "occ-1",
      fixedExpenseId: fixedExpense.id,
      occurrenceMonth: "2026-05-01",
      status: "paid",
      transactionId: paidTransaction.id,
      syncStatus: "synced",
      clientCreatedAt: "2026-05-03T00:00:00.000Z",
      clientUpdatedAt: "2026-05-03T00:00:00.000Z",
      createdAt: "2026-05-03T00:00:00.000Z",
      updatedAt: "2026-05-03T00:00:00.000Z",
    };

    const forecast = getMonthlyForecast({
      transactions: [paidTransaction],
      fixedExpenses: [fixedExpense],
      fixedExpenseOccurrences: [occurrence],
      monthlyBudget: 15000,
      targetMonth: new Date("2026-05-01T00:00:00"),
      today: new Date("2026-05-03T00:00:00"),
    });

    expect(forecast.actualFixedExpensesPaid).toBe(8500);
    expect(forecast.pendingFixedExpenses).toBe(0);
    expect(forecast.actualExpenses).toBe(8500);
  });

  it("considera pagado un gasto fijo con transaction vinculada aunque falte la occurrence", () => {
    const paidTransaction: Transaction = {
      ...variableExpense,
      id: "tx-fixed-without-occurrence",
      amount: 8500,
      fixedExpenseId: fixedExpense.id,
    };

    const forecast = getMonthlyForecast({
      transactions: [paidTransaction],
      fixedExpenses: [fixedExpense],
      fixedExpenseOccurrences: [],
      monthlyBudget: 15000,
      targetMonth: new Date("2026-05-01T00:00:00"),
      today: new Date("2026-05-03T00:00:00"),
    });

    expect(forecast.fixedExpenseItems[0]?.status).toBe("paid");
    expect(forecast.pendingFixedExpenses).toBe(0);
    expect(forecast.actualFixedExpensesPaid).toBe(8500);
  });

  it("genera warnings de pago vencido y presupuesto proyectado excedido", () => {
    const forecast = getMonthlyForecast({
      transactions: [variableExpense],
      fixedExpenses: [fixedExpense],
      fixedExpenseOccurrences: [],
      monthlyBudget: 2000,
      targetMonth: new Date("2026-05-01T00:00:00"),
      today: new Date("2026-05-10T00:00:00"),
    });

    expect(forecast.warnings.map((warning) => warning.type)).toContain("fixed_payment_overdue");
    expect(forecast.warnings.map((warning) => warning.type)).toContain("projected_budget_exceeded");
  });
});

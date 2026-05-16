import { describe, expect, it } from "vitest";
import { createFixedExpense } from "@/lib/offline/fixedExpenseRepository";
import { getPendingSyncItems } from "@/lib/offline/syncQueueRepository";
import { financeDb } from "@/lib/offline/db";

describe("fixedExpenseRepository", () => {
  it("crear fixed expense offline agrega syncQueue item", async () => {
    const fixedExpense = await createFixedExpense({
      name: "Renta",
      amount: 8500,
      categoryId: "home",
      categoryName: "Casa",
      paymentMethod: "transfer",
      paymentWindowStartDay: 1,
      paymentWindowEndDay: 5,
      activeFromMonth: "2026-05-01",
      includeInForecast: true,
    });

    const stored = await financeDb.fixedExpenses.get(fixedExpense.id);
    const pendingItems = await getPendingSyncItems();

    expect(stored?.name).toBe("Renta");
    expect(pendingItems[0]).toMatchObject({
      entity: "fixed_expense",
      entityId: fixedExpense.id,
      operation: "create",
    });
  });
});

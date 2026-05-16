import { describe, expect, it } from "vitest";
import { createFixedExpense } from "@/lib/offline/fixedExpenseRepository";
import {
  markFixedExpensePaid,
  skipFixedExpenseForMonth,
} from "@/lib/offline/fixedExpenseOccurrenceRepository";
import { getPendingSyncItems } from "@/lib/offline/syncQueueRepository";
import { financeDb } from "@/lib/offline/db";

async function seedFixedExpense() {
  return createFixedExpense({
    name: "Internet",
    amount: 599,
    categoryId: "home",
    categoryName: "Casa",
    paymentMethod: "debit_card",
    paymentWindowStartDay: 10,
    paymentWindowEndDay: 15,
    activeFromMonth: "2026-05-01",
    includeInForecast: true,
  });
}

describe("fixedExpenseOccurrenceRepository", () => {
  it("mark paid crea transaction local y occurrence paid", async () => {
    const fixedExpense = await seedFixedExpense();

    const result = await markFixedExpensePaid({
      fixedExpenseId: fixedExpense.id,
      occurrenceMonth: "2026-05-01",
      transactionDate: "2026-05-16",
    });

    const transaction = await financeDb.transactions.get(result.transaction.id);
    const occurrence = await financeDb.fixedExpenseOccurrences.get(result.occurrence.id);
    const pendingItems = await getPendingSyncItems();

    expect(transaction?.fixedExpenseId).toBe(fixedExpense.id);
    expect(occurrence?.status).toBe("paid");
    expect(pendingItems.map((item) => item.entity)).toEqual([
      "fixed_expense",
      "transaction",
      "fixed_expense_occurrence",
    ]);
  });

  it("skip crea occurrence skipped sin transaction", async () => {
    const fixedExpense = await seedFixedExpense();

    const occurrence = await skipFixedExpenseForMonth({
      fixedExpenseId: fixedExpense.id,
      occurrenceMonth: "2026-05-01",
    });

    expect(occurrence.status).toBe("skipped");
    expect(await financeDb.transactions.count()).toBe(0);
  });
});

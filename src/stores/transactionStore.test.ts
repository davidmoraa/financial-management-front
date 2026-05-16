import { describe, expect, it } from "vitest";
import { createTransaction } from "@/lib/offline/transactionRepository";
import { useTransactionStore } from "@/stores/transactionStore";

describe("transactionStore", () => {
  it("hidrata transacciones desde IndexedDB", async () => {
    const transaction = await createTransaction({
      type: "income",
      amount: 500,
      categoryId: "freelance",
      categoryName: "Freelance",
      paymentMethod: "transfer",
      transactionDate: "2026-05-16",
    });

    await useTransactionStore.getState().hydrate();

    expect(useTransactionStore.getState().isHydrated).toBe(true);
    expect(useTransactionStore.getState().transactions).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: transaction.id, amount: 500 })]),
    );
    expect(useTransactionStore.getState().pendingSyncCount).toBe(1);
  });
});

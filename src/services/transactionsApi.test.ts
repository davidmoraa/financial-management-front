import { describe, expect, it, vi } from "vitest";
import { fetchTransactions } from "@/services/transactionsApi";

describe("transactionsApi", () => {
  it("lista movimientos desde la API real", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      transactions: [
        {
          id: "tx-1",
          type: "expense",
          amount: 99,
          categoryId: "food",
          categoryName: "Comida",
          paymentMethod: "cash",
          transactionDate: "2026-05-16",
          clientCreatedAt: "2026-05-16T12:00:00.000Z",
          clientUpdatedAt: "2026-05-16T12:00:00.000Z",
          createdAt: "2026-05-16T12:00:00.000Z",
          updatedAt: "2026-05-16T12:00:00.000Z",
        },
      ],
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })));

    await expect(fetchTransactions()).resolves.toHaveLength(1);
  });
});

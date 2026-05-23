import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { financeDb } from "@/lib/offline/db";
import { CreditCardsPage } from "@/pages/CreditCardsPage";

describe("CreditCardsPage", () => {
  it("renderiza tarjetas reales desde IndexedDB", async () => {
    await financeDb.creditCards.put({
      id: "55555555-5555-4555-8555-555555555555",
      name: "Personal",
      bankName: "Banco",
      lastFourDigits: "1234",
      creditLimit: 25000,
      statementClosingDay: 12,
      paymentDueDay: 5,
      paymentDueMonthOffset: 1,
      color: "#0f766e",
      isActive: true,
      createdAt: "2026-05-22T00:00:00.000Z",
      updatedAt: "2026-05-22T00:00:00.000Z",
    });

    render(<CreditCardsPage />);

    expect(await screen.findByText("Personal")).toBeInTheDocument();
    expect(screen.getByText(/Banco/)).toBeInTheDocument();
    expect(screen.getByText("Día 12")).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { financeDb } from "@/lib/offline/db";
import { useCategoryStore } from "@/stores/categoryStore";
import { useTransactionStore } from "@/stores/transactionStore";

const creditCard = {
  id: "55555555-5555-4555-8555-555555555555",
  name: "Personal",
  bankName: "Banco",
  lastFourDigits: "1234",
  creditLimit: 25000,
  statementClosingDay: 12,
  paymentDueDay: 5,
  paymentDueMonthOffset: 1 as const,
  color: "#0f766e",
  isActive: true,
  createdAt: "2026-05-22T00:00:00.000Z",
  updatedAt: "2026-05-22T00:00:00.000Z",
};

function seedCategories() {
  useCategoryStore.setState({
    categories: [
      { id: "food", name: "Comida", type: "expense", icon: "utensils", color: "bg-emerald-100 text-emerald-700" },
    ],
    isHydrated: true,
    isHydrating: false,
  });
}

describe("TransactionForm credit cards", () => {
  it("muestra selector de tarjeta solo cuando el método es crédito", async () => {
    seedCategories();
    await financeDb.creditCards.put(creditCard);
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <TransactionForm />
      </MemoryRouter>,
    );

    expect(screen.queryByText("Tarjeta de crédito")).not.toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: /crédito/i }));

    expect(screen.getByText("Tarjeta de crédito")).toBeInTheDocument();
    expect(screen.getByText("Personal")).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: /débito/i }));

    expect(screen.queryByText("Tarjeta de crédito")).not.toBeInTheDocument();
  });

  it("impide guardar un movimiento a crédito sin tarjeta", async () => {
    seedCategories();
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <TransactionForm />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Monto"), "120");
    await user.click(screen.getByRole("radio", { name: /crédito/i }));
    await user.click(screen.getByRole("button", { name: /guardar movimiento/i }));

    expect(await screen.findByText("Elige la tarjeta de crédito.")).toBeInTheDocument();
    expect(useTransactionStore.getState().transactions).toHaveLength(0);
  });

  it("guarda creditCardId cuando el pago es con tarjeta de crédito", async () => {
    seedCategories();
    await financeDb.creditCards.put(creditCard);
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <TransactionForm />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Monto"), "120");
    await user.click(screen.getByRole("radio", { name: /crédito/i }));
    await user.click(screen.getByRole("radio", { name: /personal/i }));
    await user.click(screen.getByRole("button", { name: /guardar movimiento/i }));

    expect(await screen.findByText("Movimiento registrado")).toBeInTheDocument();
    expect(useTransactionStore.getState().transactions[0]).toMatchObject({
      paymentMethod: "credit_card",
      creditCardId: creditCard.id,
    });
  });
});

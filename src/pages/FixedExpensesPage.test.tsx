import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { FixedExpensesPage } from "@/pages/FixedExpensesPage";
import { useFixedExpenseStore } from "@/stores/fixedExpenseStore";
import { useTransactionStore } from "@/stores/transactionStore";

describe("FixedExpensesPage", () => {
  it("muestra empty state si no hay gastos fijos", () => {
    useTransactionStore.setState({
      transactions: [],
      monthlyBudget: 15000,
      isHydrated: true,
    });
    useFixedExpenseStore.setState({
      fixedExpenses: [],
      occurrences: [],
      isHydrated: true,
    });

    render(
      <MemoryRouter>
        <FixedExpensesPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Sin gastos fijos todavía")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /crear gasto fijo/i })).toBeInTheDocument();
  });
});

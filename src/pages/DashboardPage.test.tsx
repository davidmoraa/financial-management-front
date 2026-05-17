import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { DashboardPage } from "@/pages/DashboardPage";
import { useFixedExpenseStore } from "@/stores/fixedExpenseStore";
import { useTransactionStore } from "@/stores/transactionStore";

describe("DashboardPage", () => {
  it("muestra empty state real cuando no hay datos", () => {
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
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Aún no tienes movimientos registrados.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /registrar primer movimiento/i })).toBeInTheDocument();
  });

  it("muestra gastos fijos pendientes", () => {
    useTransactionStore.setState({
      transactions: [],
      monthlyBudget: 15000,
      isHydrated: true,
    });
    useFixedExpenseStore.setState({
      fixedExpenses: [
        {
          id: "fixed-1",
          name: "Internet",
          amount: 599,
          categoryId: "home",
          categoryName: "Casa",
          paymentMethod: "debit_card",
          recurrence: "monthly",
          paymentWindowStartDay: 10,
          paymentWindowEndDay: 15,
          activeFromMonth: new Date().toISOString().slice(0, 8) + "01",
          includeInForecast: true,
          isActive: true,
          syncStatus: "synced",
          clientCreatedAt: new Date().toISOString(),
          clientUpdatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      occurrences: [],
      isHydrated: true,
    });

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Internet")).toBeInTheDocument();
    expect(screen.getAllByText(/pendientes/i).length).toBeGreaterThan(0);
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { NewTransactionPage } from "@/pages/NewTransactionPage";
import { useCategoryStore } from "@/stores/categoryStore";
import { useNetworkStore } from "@/stores/networkStore";
import { useTransactionStore } from "@/stores/transactionStore";

describe("NewTransactionPage", () => {
  it("permite guardar aunque isOnline sea false", async () => {
    useNetworkStore.setState({ isOnline: false });
    useCategoryStore.setState({
      categories: [
        { id: "food", name: "Comida", type: "expense", icon: "utensils", color: "bg-emerald-100 text-emerald-700" },
      ],
      isHydrated: true,
      isHydrating: false,
    });
    const user = userEvent.setup();

    render(<NewTransactionPage />);

    await user.type(screen.getByLabelText("Monto"), "88");
    await user.click(screen.getByRole("button", { name: /guardar movimiento/i }));

    expect(await screen.findByText("Movimiento registrado")).toBeInTheDocument();
    expect(screen.getByText("Movimiento registrado. Tu proyección se actualizó.")).toBeInTheDocument();
    expect(screen.getByText("Claridad financiera al día")).toBeInTheDocument();
    expect(await screen.findByText("Guardado en este dispositivo. Se sincronizará cuando vuelva internet.")).toBeInTheDocument();
    expect(screen.getByLabelText("Monto")).toHaveValue(null);
    expect(useTransactionStore.getState().transactions).toHaveLength(1);
    expect(useTransactionStore.getState().transactions[0]).toMatchObject({
      amount: 88,
      syncStatus: "pending",
    });
  });
});

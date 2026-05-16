import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { NewTransactionPage } from "@/pages/NewTransactionPage";
import { useNetworkStore } from "@/stores/networkStore";
import { useTransactionStore } from "@/stores/transactionStore";

describe("NewTransactionPage", () => {
  it("permite guardar aunque isOnline sea false", async () => {
    useNetworkStore.setState({ isOnline: false });
    const user = userEvent.setup();

    render(<NewTransactionPage />);

    await user.type(screen.getByLabelText("Monto"), "88");
    await user.click(screen.getByRole("button", { name: /guardar movimiento/i }));

    expect(await screen.findByText("Guardado en este dispositivo. Se sincronizará cuando vuelva internet.")).toBeInTheDocument();
    expect(useTransactionStore.getState().transactions).toHaveLength(1);
    expect(useTransactionStore.getState().transactions[0]).toMatchObject({
      amount: 88,
      syncStatus: "pending",
    });
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LocalDataAfterLoginDialog } from "@/components/auth/LocalDataAfterLoginDialog";
import { createTransaction } from "@/lib/offline/transactionRepository";
import { useAuthStore } from "@/stores/authStore";

describe("LocalDataAfterLoginDialog", () => {
  it("muestra diálogo si hay datos locales después de login", async () => {
    await createTransaction({
      type: "expense",
      amount: 120,
      categoryId: "food",
      categoryName: "Comida",
      paymentMethod: "cash",
      transactionDate: "2026-05-16",
    });
    useAuthStore.setState({
      isAuthenticated: true,
      token: "token",
      user: { id: "user-1", email: "test@example.com" },
      linkedProviders: [{ provider: "google", email: "test@example.com", emailVerified: true }],
    });

    render(<LocalDataAfterLoginDialog />);

    expect(await screen.findByText("Encontramos datos guardados en este dispositivo.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /subirlos a mi cuenta/i })).toBeInTheDocument();
  });
});

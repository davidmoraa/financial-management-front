import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { LocalDataAfterLoginDialog } from "@/components/auth/LocalDataAfterLoginDialog";
import { financeDb } from "@/lib/offline/db";
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

  it("permite descartar datos locales con confirmación propia", async () => {
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
    const user = userEvent.setup();

    render(<LocalDataAfterLoginDialog />);

    await user.click(await screen.findByRole("button", { name: /descartar datos locales/i }));

    expect(screen.getByText("¿Descartar datos locales?")).toBeInTheDocument();
    expect(screen.getByText(/se borrarán todos los registros locales/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /sí, borrar registros locales/i }));

    expect(await financeDb.transactions.count()).toBe(0);
    expect(await financeDb.syncQueue.count()).toBe(0);
  });
});

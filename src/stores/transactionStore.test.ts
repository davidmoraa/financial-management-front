import { describe, expect, it, vi } from "vitest";
import { AUTH_TOKEN_STORAGE_KEY } from "@/lib/api/client";
import { createTransaction } from "@/lib/offline/transactionRepository";
import { syncPendingItems } from "@/lib/offline/syncEngine";
import { useCategoryStore } from "@/stores/categoryStore";
import { useTransactionStore } from "@/stores/transactionStore";

vi.mock("@/lib/offline/syncEngine", () => ({
  syncPendingItems: vi.fn(async () => ({ processed: 1 })),
}));

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

  it("sincroniza inmediatamente al agregar un movimiento si hay sesión y conexión", async () => {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, "token");
    setNavigatorOnline(true);
    useCategoryStore.setState({
      categories: [{ id: "food", name: "Comida", type: "expense", icon: "utensils", color: "bg-emerald-100 text-emerald-700" }],
      isHydrated: true,
      isHydrating: false,
    });

    await useTransactionStore.getState().addTransaction({
      type: "expense",
      amount: 120,
      categoryId: "food",
      paymentMethod: "cash",
      transactionDate: "2026-05-25",
      note: "",
    });

    expect(syncPendingItems).toHaveBeenCalledTimes(1);
  });

  it("no intenta sincronizar inmediatamente al agregar offline", async () => {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, "token");
    setNavigatorOnline(false);
    useCategoryStore.setState({
      categories: [{ id: "food", name: "Comida", type: "expense", icon: "utensils", color: "bg-emerald-100 text-emerald-700" }],
      isHydrated: true,
      isHydrating: false,
    });
    vi.mocked(syncPendingItems).mockClear();

    await useTransactionStore.getState().addTransaction({
      type: "expense",
      amount: 120,
      categoryId: "food",
      paymentMethod: "cash",
      transactionDate: "2026-05-25",
      note: "",
    });

    expect(syncPendingItems).not.toHaveBeenCalled();
    expect(useTransactionStore.getState().pendingSyncCount).toBe(1);
  });
});

function setNavigatorOnline(isOnline: boolean) {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    value: isOnline,
  });
}

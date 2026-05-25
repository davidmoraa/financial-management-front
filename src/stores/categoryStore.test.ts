import { describe, expect, it } from "vitest";
import { defaultCategories } from "@/lib/categories/defaultCategories";
import { financeDb } from "@/lib/offline/db";
import { useCategoryStore } from "@/stores/categoryStore";

describe("categoryStore", () => {
  it("si no hay catálogo remoto/cacheado, hidrata categorías base para captura offline", async () => {
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: false,
    });

    await useCategoryStore.getState().hydrate();

    const expenseCategories = useCategoryStore.getState().getCategoriesByType("expense");
    const incomeCategories = useCategoryStore.getState().getCategoriesByType("income");
    const persistedCategories = await financeDb.categories.toArray();

    expect(expenseCategories.some((category) => category.id === "food")).toBe(true);
    expect(incomeCategories.some((category) => category.id === "salary")).toBe(true);
    expect(persistedCategories).toHaveLength(defaultCategories.length);
  });
});

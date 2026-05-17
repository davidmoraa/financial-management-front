import { create } from "zustand";
import { AUTH_TOKEN_STORAGE_KEY } from "@/lib/api/client";
import { ensureOfflineDatabaseReady, financeDb } from "@/lib/offline/db";
import { fetchCategories } from "@/services/categoriesApi";
import type { Category, TransactionType } from "@/types/finance";

type CategoryState = {
  categories: Category[];
  isHydrated: boolean;
  isHydrating: boolean;
  hydrate: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  getCategoriesByType: (type: TransactionType) => Category[];
  getCategoryById: (id: string) => Category | undefined;
};

function canFetchRemoteCategories() {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)) && window.navigator.onLine;
}

async function loadCategories() {
  await ensureOfflineDatabaseReady();

  if (canFetchRemoteCategories()) {
    try {
      const remoteCategories = await fetchCategories();
      await financeDb.categories.bulkPut(remoteCategories);
      return remoteCategories;
    } catch {
      // Fall back to the last cached category catalog.
    }
  }

  return financeDb.categories.orderBy("name").toArray();
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isHydrated: false,
  isHydrating: false,
  hydrate: async () => {
    if (get().isHydrating) {
      return;
    }

    set({ isHydrating: true });
    const categories = await loadCategories();
    set({ categories, isHydrated: true, isHydrating: false });
  },
  refreshCategories: async () => {
    const categories = await loadCategories();
    set({ categories, isHydrated: true, isHydrating: false });
  },
  getCategoriesByType: (type) => get().categories.filter((category) => category.type === type),
  getCategoryById: (id) => get().categories.find((category) => category.id === id),
}));

import { create } from "zustand";
import type { Category, TransactionType } from "@/types/finance";

type CategoryState = {
  categories: Category[];
  getCategoriesByType: (type: TransactionType) => Category[];
  getCategoryById: (id: string) => Category | undefined;
};

const initialCategories: Category[] = [
  { id: "food", name: "Comida", type: "expense", icon: "utensils", color: "bg-emerald-100 text-emerald-700" },
  { id: "transport", name: "Transporte", type: "expense", icon: "car", color: "bg-sky-100 text-sky-700" },
  { id: "home", name: "Casa", type: "expense", icon: "home", color: "bg-teal-100 text-teal-700" },
  { id: "health", name: "Salud", type: "expense", icon: "heart-pulse", color: "bg-rose-100 text-rose-700" },
  { id: "leisure", name: "Ocio", type: "expense", icon: "sparkles", color: "bg-lime-100 text-lime-700" },
  { id: "subscriptions", name: "Suscripciones", type: "expense", icon: "repeat", color: "bg-indigo-100 text-indigo-700" },
  { id: "shopping", name: "Compras", type: "expense", icon: "shopping-bag", color: "bg-amber-100 text-amber-700" },
  { id: "other-expense", name: "Otros", type: "expense", icon: "more-horizontal", color: "bg-slate-100 text-slate-700" },
  { id: "salary", name: "Sueldo", type: "income", icon: "briefcase-business", color: "bg-emerald-100 text-emerald-700" },
  { id: "freelance", name: "Freelance", type: "income", icon: "laptop", color: "bg-cyan-100 text-cyan-700" },
  { id: "sale", name: "Venta", type: "income", icon: "badge-dollar-sign", color: "bg-lime-100 text-lime-700" },
  { id: "investment", name: "Inversión", type: "income", icon: "trending-up", color: "bg-teal-100 text-teal-700" },
  { id: "other-income", name: "Otro ingreso", type: "income", icon: "circle-dollar-sign", color: "bg-slate-100 text-slate-700" },
];

export const useCategoryStore = create<CategoryState>((_, get) => ({
  categories: initialCategories,
  getCategoriesByType: (type) => get().categories.filter((category) => category.type === type),
  getCategoryById: (id) => get().categories.find((category) => category.id === id),
}));

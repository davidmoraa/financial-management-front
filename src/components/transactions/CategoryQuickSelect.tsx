import { useMemo } from "react";
import type { TransactionType } from "@/types/finance";
import { useCategoryStore } from "@/stores/categoryStore";
import { CategoryBadge } from "@/components/categories/CategoryBadge";
import { cn } from "@/lib/utils";

type CategoryQuickSelectProps = {
  type: TransactionType;
  value: string;
  onChange: (categoryId: string) => void;
};

export function CategoryQuickSelect({ type, value, onChange }: CategoryQuickSelectProps) {
  const allCategories = useCategoryStore((state) => state.categories);
  const categories = useMemo(
    () => allCategories.filter((category) => category.type === type),
    [allCategories, type],
  );

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Categoría">
      {categories.length === 0 && (
        <p className="rounded-2xl bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-900">
          No hay categorías disponibles. Intenta sincronizar cuando tengas conexión.
        </p>
      )}
      {categories.map((category) => {
        const selected = value === category.id;

        return (
          <button
            key={category.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(category.id)}
            className={cn(
              "min-w-0 rounded-2xl outline-none transition hover:scale-[1.01] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              selected && "scale-[1.02]",
            )}
          >
            <CategoryBadge category={category} selected={selected} className="h-11 w-full justify-center rounded-2xl px-2 text-xs sm:text-sm" />
          </button>
        );
      })}
    </div>
  );
}

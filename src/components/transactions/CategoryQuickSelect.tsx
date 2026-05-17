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
    <div className="flex gap-2 overflow-x-auto pb-2 md:flex-wrap md:overflow-visible" role="radiogroup" aria-label="Categoría">
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
              "shrink-0 rounded-full outline-none transition hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              selected && "scale-[1.02]",
            )}
          >
            <CategoryBadge category={category} selected={selected} />
          </button>
        );
      })}
    </div>
  );
}

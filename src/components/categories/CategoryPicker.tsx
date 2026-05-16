import { useMemo } from "react";
import type { TransactionType } from "@/types/finance";
import { useCategoryStore } from "@/stores/categoryStore";
import { CategoryBadge } from "@/components/categories/CategoryBadge";

type CategoryPickerProps = {
  type: TransactionType;
};

export function CategoryPicker({ type }: CategoryPickerProps) {
  const allCategories = useCategoryStore((state) => state.categories);
  const categories = useMemo(
    () => allCategories.filter((category) => category.type === type),
    [allCategories, type],
  );

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <CategoryBadge key={category.id} category={category} />
      ))}
    </div>
  );
}

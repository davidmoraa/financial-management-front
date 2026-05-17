import { CategoryPicker } from "@/components/categories/CategoryPicker";
import { Card } from "@/components/ui/card";
import { useCategoryStore } from "@/stores/categoryStore";

export function CategoriesPage() {
  const categories = useCategoryStore((state) => state.categories);
  const isHydrated = useCategoryStore((state) => state.isHydrated);
  const expenseCount = categories.filter((category) => category.type === "expense").length;
  const incomeCount = categories.filter((category) => category.type === "income").length;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card className="p-5">
        <div className="mb-5">
          <h2 className="text-lg font-bold tracking-normal text-foreground">Gastos</h2>
          <p className="mt-1 text-sm text-muted-foreground">Categorías disponibles desde tu catálogo actual.</p>
        </div>
        {isHydrated && expenseCount === 0 ? <EmptyCategories /> : <CategoryPicker type="expense" />}
      </Card>

      <Card className="p-5">
        <div className="mb-5">
          <h2 className="text-lg font-bold tracking-normal text-foreground">Ingresos</h2>
          <p className="mt-1 text-sm text-muted-foreground">Fuentes reales disponibles para clasificar entradas.</p>
        </div>
        {isHydrated && incomeCount === 0 ? <EmptyCategories /> : <CategoryPicker type="income" />}
      </Card>
    </div>
  );
}

function EmptyCategories() {
  return <p className="rounded-2xl bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-900">No hay categorías disponibles todavía.</p>;
}

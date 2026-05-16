import { CategoryPicker } from "@/components/categories/CategoryPicker";
import { Card } from "@/components/ui/card";

export function CategoriesPage() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card className="p-5">
        <div className="mb-5">
          <h2 className="text-lg font-bold tracking-normal text-foreground">Gastos</h2>
          <p className="mt-1 text-sm text-muted-foreground">Categorías iniciales para entender en qué se va tu dinero.</p>
        </div>
        <CategoryPicker type="expense" />
      </Card>

      <Card className="p-5">
        <div className="mb-5">
          <h2 className="text-lg font-bold tracking-normal text-foreground">Ingresos</h2>
          <p className="mt-1 text-sm text-muted-foreground">Fuentes mock listas para clasificar entradas.</p>
        </div>
        <CategoryPicker type="income" />
      </Card>
    </div>
  );
}

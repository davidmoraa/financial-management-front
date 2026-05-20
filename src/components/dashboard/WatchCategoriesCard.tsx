import { CheckCircle2, Tags } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { DashboardSummary } from "@/types/dashboard";

type WatchCategoriesCardProps = {
  summary: DashboardSummary;
};

export function WatchCategoriesCard({ summary }: WatchCategoriesCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase tracking-normal text-primary">Categorías</p>
          <h2 className="mt-1 text-lg font-black tracking-normal text-foreground">A vigilar</h2>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-primary">
          <Tags className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {summary.categoriesToWatch.length > 0 ? (
          summary.categoriesToWatch.slice(0, 4).map((category) => (
            <div key={category.categoryId} className="rounded-[1.25rem] border border-border bg-white/70 p-3">
              <div className="flex min-w-0 items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-foreground">{category.name}</p>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground">{formatCurrency(category.spent)} gastado</p>
                </div>
                <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-black", statusClass(category.status))}>
                  {category.percentage}%
                </span>
              </div>
              <Progress
                value={category.percentage}
                className="mt-3"
                indicatorClassName={category.status === "danger" ? "bg-red-500" : category.status === "warning" ? "bg-amber-400" : "bg-primary"}
              />
            </div>
          ))
        ) : (
          <div className="rounded-[1.25rem] bg-emerald-50 p-4 text-emerald-800">
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            <p className="mt-2 text-sm font-black">Sin categorías en alerta.</p>
            <p className="mt-1 text-xs font-semibold leading-5">Cuando una categoría acelere, aparecerá aquí.</p>
          </div>
        )}
      </div>
    </Card>
  );
}

function statusClass(status: "ok" | "warning" | "danger") {
  if (status === "danger") return "bg-red-100 text-red-700";
  if (status === "warning") return "bg-amber-100 text-amber-700";
  return "bg-teal-100 text-teal-700";
}

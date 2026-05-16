import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { BudgetWarning } from "@/types/fixedExpenses";

type BudgetWarningsCardProps = {
  warnings: BudgetWarning[];
};

export function BudgetWarningsCard({ warnings }: BudgetWarningsCardProps) {
  const visibleWarnings = warnings.slice(0, 4);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-normal text-primary">Advertencias</p>
          <h2 className="mt-1 text-lg font-bold tracking-normal text-foreground">Ritmo del mes</h2>
        </div>
        <Info className="h-5 w-5 text-primary" aria-hidden="true" />
      </div>

      <div className="mt-4 space-y-2">
        {visibleWarnings.length === 0 ? (
          <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-3 text-emerald-800">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-bold">Sin alertas relevantes</p>
              <p className="mt-1 text-xs font-semibold leading-5">Tu presupuesto se ve estable con los datos actuales.</p>
            </div>
          </div>
        ) : (
          visibleWarnings.map((warning) => (
            <div
              key={warning.id}
              className={cn(
                "flex items-start gap-3 rounded-2xl p-3",
                warning.severity === "danger" && "bg-red-50 text-red-800",
                warning.severity === "warning" && "bg-amber-50 text-amber-800",
                warning.severity === "info" && "bg-teal-50 text-teal-800",
              )}
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-bold">{warning.title}</p>
                <p className="mt-1 text-xs font-semibold leading-5">{warning.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

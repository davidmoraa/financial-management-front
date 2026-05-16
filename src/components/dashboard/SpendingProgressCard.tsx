import { AlertTriangle, BadgeCheck, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

type SpendingProgressCardProps = {
  expense: number;
  budget: number;
  percentage: number;
};

export function SpendingProgressCard({ expense, budget, percentage }: SpendingProgressCardProps) {
  const isOver = percentage > 100;
  const isWarning = percentage >= 80 && !isOver;
  const Icon = isOver || isWarning ? AlertTriangle : BadgeCheck;
  const status = isOver ? "Presupuesto excedido" : isWarning ? "Cerca del límite" : "Ritmo saludable";
  const budgetDifference = budget - expense;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">Presupuesto mensual</p>
          <p className="mt-1 text-2xl font-bold tracking-normal text-foreground">{formatCurrency(budget)}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-100 text-lime-700">
          <Target className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-foreground">{formatCurrency(expense)} usado</span>
          <span className={cn("font-bold", isOver ? "text-red-600" : isWarning ? "text-amber-600" : "text-primary")}>{percentage}%</span>
        </div>
        <Progress
          value={percentage}
          indicatorClassName={cn(isOver ? "bg-red-500" : isWarning ? "bg-amber-400" : "bg-primary")}
        />
      </div>

      <div className={cn("mt-4 flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold", isOver ? "bg-red-50 text-red-700" : isWarning ? "bg-amber-50 text-amber-700" : "bg-teal-50 text-teal-700")}>
        <Icon className="h-4 w-4" aria-hidden="true" />
        {status}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl border border-border/70 bg-white/65 px-3 py-3">
        <span className="text-sm font-semibold text-muted-foreground">Diferencia contra presupuesto</span>
        <span className={cn("text-sm font-bold", budgetDifference < 0 ? "text-red-600" : "text-primary")}>
          {formatCurrency(budgetDifference)}
        </span>
      </div>
    </Card>
  );
}

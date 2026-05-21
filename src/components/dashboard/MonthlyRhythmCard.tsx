import { Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { DashboardSummary } from "@/types/dashboard";

type MonthlyRhythmCardProps = {
  summary: DashboardSummary;
};

export function MonthlyRhythmCard({ summary }: MonthlyRhythmCardProps) {
  const hasBudget = summary.budget.monthlyBudget > 0;
  const usedPercentage = Number.isFinite(summary.budget.usedPercentage) ? summary.budget.usedPercentage : 0;
  const isRisk = usedPercentage >= 100;
  const isWarning = usedPercentage >= 80 && !isRisk;
  const Icon = isRisk || isWarning ? AlertTriangle : CheckCircle2;
  const periodLabel = summary.period?.shortLabel.toLowerCase() ?? "mes";

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase tracking-normal text-primary">Ritmo del periodo</p>
          <h2 className="mt-1 text-lg font-black tracking-normal text-foreground">
            {hasBudget ? `${usedPercentage}% usado` : "Presupuesto pendiente"}
          </h2>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lime-100 text-lime-700">
          <Activity className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      {hasBudget ? (
        <div className="mt-5">
          <Progress
            value={usedPercentage}
            indicatorClassName={cn(isRisk ? "bg-red-500" : isWarning ? "bg-amber-400" : "bg-primary")}
          />
          <div className="mt-4 grid gap-2">
            <RhythmRow label={`Presupuesto de ${periodLabel}`} value={formatCurrency(summary.budget.monthlyBudget)} />
            <RhythmRow label="Gastado" value={formatCurrency(summary.budget.used)} />
            <RhythmRow label="Gastos fijos pendientes" value={formatCurrency(summary.expenses.fixedPending)} />
          </div>
          <div className={cn("mt-4 flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-bold", isRisk ? "bg-red-50 text-red-700" : isWarning ? "bg-amber-50 text-amber-700" : "bg-teal-50 text-teal-700")}>
            <Icon className="h-4 w-4" aria-hidden="true" />
            {isRisk ? "Presupuesto excedido" : isWarning ? "Cerca del límite" : "Ritmo saludable"}
          </div>
        </div>
      ) : (
        <p className="mt-5 rounded-2xl bg-teal-50 px-4 py-3 text-sm font-semibold leading-6 text-teal-800">
          Define tu presupuesto para activar el ritmo mensual y el gasto seguro.
        </p>
      )}
    </Card>
  );
}

function RhythmRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-2xl bg-white/70 px-3 py-2">
      <span className="min-w-0 truncate text-sm font-semibold text-muted-foreground">{label}</span>
      <span className="shrink-0 text-sm font-black text-foreground">{value}</span>
    </div>
  );
}

import { CheckCircle2, Clock3, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { DashboardSummary } from "@/types/dashboard";

type FinancialClarityBadgeProps = {
  currentDate: Date;
  summary?: DashboardSummary;
};

export function FinancialClarityBadge({ currentDate, summary }: FinancialClarityBadgeProps) {
  const todayKey = format(currentDate, "yyyy-MM-dd");
  const hasMovementToday = Boolean(summary?.recentMovements?.some((movement) => movement.date === todayKey));
  const hasAnyActivity = Boolean(summary && !isSummaryEmpty(summary));
  const clarityState = getClarityState({ hasAnyActivity, hasMovementToday, isAtRisk: summary?.habit.isAtRisk });
  const Icon = clarityState.icon;

  return (
    <div
      className={cn(
        "inline-flex min-w-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black",
        clarityState.className,
      )}
      title={clarityState.description}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="truncate">{clarityState.label}</span>
    </div>
  );
}

function isSummaryEmpty(summary: DashboardSummary) {
  return (
    (summary.recentMovements ?? []).length === 0 &&
    summary.income.received === 0 &&
    summary.expenses.spent === 0 &&
    summary.expenses.fixedPending === 0
  );
}

function getClarityState(input: { hasAnyActivity: boolean; hasMovementToday: boolean; isAtRisk?: boolean }) {
  if (input.hasMovementToday) {
    return {
      className: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100",
      description: "Tus registros de hoy ya alimentan la proyección.",
      icon: ShieldCheck,
      label: "Claridad alta: actualizado hoy",
    };
  }

  if (input.isAtRisk || input.hasAnyActivity) {
    return {
      className: "bg-lime-50 text-lime-800 ring-1 ring-lime-100",
      description: "Un registro hoy mantiene tu lectura financiera precisa.",
      icon: Clock3,
      label: "Claridad por actualizar",
    };
  }

  return {
    className: "bg-teal-50 text-teal-800 ring-1 ring-teal-100",
    description: "Registra tu primer movimiento para activar claridad financiera.",
    icon: CheckCircle2,
    label: "Listo para activar claridad",
  };
}

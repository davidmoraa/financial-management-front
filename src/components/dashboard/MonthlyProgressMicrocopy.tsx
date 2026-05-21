import { CheckCircle2, ShieldAlert, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardSummary } from "@/types/dashboard";

type MonthlyProgressMicrocopyProps = {
  summary: DashboardSummary;
  usedPercentage: number;
};

export function MonthlyProgressMicrocopy({ summary, usedPercentage }: MonthlyProgressMicrocopyProps) {
  const state = getMicrocopy(summary, usedPercentage);
  const Icon = state.icon;

  return (
    <div className={cn("mt-4 rounded-2xl px-3 py-3 text-sm font-bold leading-6", state.className)}>
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>{state.copy}</p>
      </div>
    </div>
  );
}

function getMicrocopy(summary: DashboardSummary, usedPercentage: number) {
  if (summary.budget.monthlyBudget <= 0) {
    return {
      className: "bg-teal-50 text-teal-800",
      copy: "Define tu presupuesto para activar gasto seguro y señales más útiles.",
      icon: TrendingUp,
    };
  }

  if (usedPercentage >= 100) {
    return {
      className: "bg-red-50 text-red-700",
      copy: "Pausa útil: revisa el plan antes de asumir nuevos gastos variables.",
      icon: ShieldAlert,
    };
  }

  if (usedPercentage >= 80) {
    return {
      className: "bg-amber-50 text-amber-800",
      copy: "Vas cerca del límite. Un registro al día mantiene clara la ruta de cierre.",
      icon: ShieldAlert,
    };
  }

  if (summary.expenses.fixedPending > 0) {
    return {
      className: "bg-lime-50 text-lime-900",
      copy: "Buen ritmo. Reserva los pagos fijos pendientes antes de decidir gastos variables.",
      icon: CheckCircle2,
    };
  }

  return {
    className: "bg-teal-50 text-teal-800",
    copy: "Claridad estable. Tus registros sostienen una proyección confiable.",
    icon: CheckCircle2,
  };
}

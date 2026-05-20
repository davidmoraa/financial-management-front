import { ArrowDownRight, ArrowUpRight, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import type { DashboardSummary } from "@/types/dashboard";

type CashflowProjectionCardProps = {
  summary: DashboardSummary;
};

export function CashflowProjectionCard({ summary }: CashflowProjectionCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase tracking-normal text-primary">Proyección</p>
          <h2 className="mt-1 text-lg font-black tracking-normal text-foreground">Flujo de efectivo</h2>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-primary">
          <TrendingUp className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <ProjectionMetric icon={ArrowUpRight} label="Ingreso esperado" value={formatCurrency(summary.income.expected)} />
        <ProjectionMetric icon={ArrowUpRight} label="Ingreso recibido" value={formatCurrency(summary.income.received)} />
        <ProjectionMetric icon={ArrowDownRight} label="Gasto registrado" value={formatCurrency(summary.expenses.spent)} />
        <ProjectionMetric icon={ArrowDownRight} label="Fijos pendientes" value={formatCurrency(summary.expenses.fixedPending)} />
      </div>

      <div className="mt-4 rounded-[1.25rem] bg-teal-50/80 p-4">
        <p className="text-sm font-bold text-teal-800">Cierre proyectado</p>
        <p className="mt-1 text-2xl font-black text-foreground">{formatCurrency(summary.balance.projectedEndOfMonth)}</p>
      </div>
    </Card>
  );
}

function ProjectionMetric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-border bg-white/70 p-3">
      <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
      <p className="mt-2 truncate text-xs font-bold uppercase tracking-normal text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-base font-black text-foreground">{value}</p>
    </div>
  );
}

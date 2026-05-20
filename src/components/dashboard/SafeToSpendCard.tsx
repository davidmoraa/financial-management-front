import { Gauge, PiggyBank, WalletCards } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import type { DashboardSummary } from "@/types/dashboard";

type SafeToSpendCardProps = {
  summary: DashboardSummary;
};

export function SafeToSpendCard({ summary }: SafeToSpendCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-black uppercase tracking-normal text-primary">Gasto seguro</p>
          <h2 className="mt-1 text-3xl font-black tracking-normal text-foreground">{formatCurrency(summary.spendingPower.safeToSpendToday)}</h2>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">para usar hoy sin salirte del plan.</p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lime-100 text-lime-700">
          <Gauge className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-5 grid gap-2">
        <SafeMetric icon={WalletCards} label="Recomendado diario" value={formatCurrency(summary.spendingPower.recommendedDailySpend)} />
        <SafeMetric icon={PiggyBank} label="Variable disponible" value={formatCurrency(summary.spendingPower.remainingVariableBudget)} />
      </div>
    </Card>
  );
}

function SafeMetric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-2xl bg-teal-50/70 px-3 py-3">
      <span className="flex min-w-0 items-center gap-2 text-sm font-bold text-teal-800">
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="truncate">{label}</span>
      </span>
      <span className="shrink-0 text-sm font-black text-foreground">{value}</span>
    </div>
  );
}

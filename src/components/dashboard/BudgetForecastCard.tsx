import { CalendarClock, Gauge, PiggyBank, WalletCards } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/formatters";
import type { MonthlyForecast } from "@/types/fixedExpenses";

type BudgetForecastCardProps = {
  monthlyBudget: number;
  forecast: MonthlyForecast;
};

export function BudgetForecastCard({ monthlyBudget, forecast }: BudgetForecastCardProps) {
  const remaining = monthlyBudget - forecast.projectedMonthEndExpenses;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-normal text-primary">Proyección mensual</p>
          <h2 className="mt-1 text-xl font-bold tracking-normal text-foreground">{formatCurrency(forecast.projectedMonthEndExpenses)}</h2>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-100 text-lime-700">
          <Gauge className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <Progress value={Math.min(forecast.budgetUsedPercentage, 100)} />
        <div className="grid gap-3 sm:grid-cols-2">
          <ForecastMetric icon={WalletCards} label="Gasto real" value={formatCurrency(forecast.actualExpenses)} />
          <ForecastMetric icon={CalendarClock} label="Fijos pendientes" value={formatCurrency(forecast.pendingFixedExpenses)} />
          <ForecastMetric icon={PiggyBank} label="Restante estimado" value={formatCurrency(remaining)} />
          <ForecastMetric icon={Gauge} label="Diario seguro" value={formatCurrency(forecast.safeDailySpend)} />
        </div>
      </div>
    </Card>
  );
}

function ForecastMetric({ icon: Icon, label, value }: { icon: typeof Gauge; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-white/70 p-3">
      <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
      <p className="mt-2 text-xs font-bold uppercase tracking-normal text-muted-foreground">{label}</p>
      <p className="mt-1 text-base font-bold text-foreground">{value}</p>
    </div>
  );
}

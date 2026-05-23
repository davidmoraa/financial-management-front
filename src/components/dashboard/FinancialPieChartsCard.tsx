import { PieChart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { MonthlyForecast } from "@/types/fixedExpenses";

type FinancialPieChartsCardProps = {
  income: number;
  actualIncome: number;
  expense: number;
  forecast: MonthlyForecast;
};

export function FinancialPieChartsCard({ income, actualIncome, expense, forecast }: FinancialPieChartsCardProps) {
  const available = Math.max(0, income - expense);
  const usedPercentage = income > 0 ? Math.min(100, Math.round((expense / income) * 100)) : 0;
  const fixedAmount = forecast.actualFixedExpensesPaid + forecast.pendingFixedExpenses;
  const variableAmount = Math.max(0, expense - forecast.actualFixedExpensesPaid);
  const fixedPercentage = expense > 0 ? Math.min(100, Math.round((fixedAmount / Math.max(expense, fixedAmount)) * 100)) : 0;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-normal text-primary">Visualización</p>
          <h2 className="mt-1 text-lg font-bold tracking-normal text-foreground">Distribución del mes</h2>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-100 text-primary">
          <PieChart className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <PieBlock
          title="Ingreso vs gasto"
          value={`${usedPercentage}%`}
          segments={[
            { label: "Gastado", amount: expense, color: "#0f8f7f" },
            { label: "Disponible", amount: available, color: "#bdf171" },
          ]}
        />
        <PieBlock
          title="Tipo de gasto"
          value={expense > 0 || fixedAmount > 0 ? `${fixedPercentage}%` : "0%"}
          segments={[
            { label: "Fijo", amount: fixedAmount, color: "#0e7490" },
            { label: "Variable", amount: variableAmount, color: "#99f6e4" },
          ]}
        />
      </div>

      <div className="mt-4 grid gap-2 text-xs font-semibold text-muted-foreground">
        <LegendItem color="#0f8f7f" label="Gasto real" value={formatCurrency(expense)} />
        <LegendItem color="#bdf171" label="Disponible estimado" value={formatCurrency(available)} />
        <LegendItem color="#0e7490" label="Fijos pagados o pendientes" value={formatCurrency(fixedAmount)} />
        <LegendItem color="#99f6e4" label="Variables reales" value={formatCurrency(variableAmount)} />
        {actualIncome > 0 && actualIncome < income && (
          <p className="rounded-2xl bg-teal-50 px-3 py-2 text-teal-800">
            Ingreso real registrado: {formatCurrency(actualIncome)}. El balance usa tu ingreso esperado para planeación.
          </p>
        )}
      </div>
    </Card>
  );
}

function PieBlock({
  title,
  value,
  segments,
}: {
  title: string;
  value: string;
  segments: Array<{ label: string; amount: number; color: string }>;
}) {
  const total = segments.reduce((sum, segment) => sum + Math.max(0, segment.amount), 0);
  const gradient = total > 0 ? buildConicGradient(segments, total) : "conic-gradient(#e6f4f1 0 100%)";

  return (
    <div className="rounded-3xl border border-border bg-white/70 p-4">
      <div className="mx-auto grid h-32 w-32 place-items-center rounded-full" style={{ background: gradient }}>
        <div className="grid h-20 w-20 place-items-center rounded-full bg-white shadow-soft">
          <span className="text-lg font-bold text-foreground">{value}</span>
        </div>
      </div>
      <p className="mt-3 text-center text-sm font-bold text-foreground">{title}</p>
    </div>
  );
}

function LegendItem({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/65 px-3 py-2">
      <span className="flex min-w-0 items-center gap-2">
        <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full")} style={{ backgroundColor: color }} />
        <span className="truncate">{label}</span>
      </span>
      <span className="shrink-0 font-bold text-foreground">{value}</span>
    </div>
  );
}

function buildConicGradient(segments: Array<{ amount: number; color: string }>, total: number) {
  let cursor = 0;
  const stops = segments.map((segment) => {
    const start = cursor;
    const end = cursor + (Math.max(0, segment.amount) / total) * 100;
    cursor = end;
    return `${segment.color} ${start}% ${end}%`;
  });
  return `conic-gradient(${stops.join(", ")})`;
}

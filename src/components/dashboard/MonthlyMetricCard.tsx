import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

type MonthlyMetricCardProps = {
  label: string;
  amount: number;
  icon: LucideIcon;
  variant: "income" | "expense";
};

export function MonthlyMetricCard({ label, amount, icon: Icon, variant }: MonthlyMetricCardProps) {
  const isIncome = variant === "income";

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-2xl",
            isIncome ? "bg-emerald-100 text-emerald-700" : "bg-teal-100 text-teal-700",
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", isIncome ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600")}>
          {isIncome ? "Entra" : "Sale"}
        </span>
      </div>
      <p className="mt-5 text-sm font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-normal text-foreground">{formatCurrency(amount)}</p>
    </Card>
  );
}

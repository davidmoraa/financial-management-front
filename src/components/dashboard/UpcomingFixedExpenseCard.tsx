import { Link } from "react-router-dom";
import { CalendarClock, CheckCircle2, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatTransactionDate } from "@/lib/formatters";
import type { DashboardSummary } from "@/types/dashboard";

type UpcomingFixedExpenseCardProps = {
  summary: DashboardSummary;
};

export function UpcomingFixedExpenseCard({ summary }: UpcomingFixedExpenseCardProps) {
  const next = summary.nextFixedExpense;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase tracking-normal text-primary">Próximo pago</p>
          <h2 className="mt-1 text-lg font-black tracking-normal text-foreground">Gasto fijo</h2>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-primary">
          <CalendarClock className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      {next ? (
        <div className="mt-5">
          <div className="rounded-[1.25rem] border border-teal-100 bg-teal-50/60 p-4">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-lg font-black text-foreground">{next.name}</p>
                <p className="mt-1 text-sm font-semibold text-muted-foreground">{formatTransactionDate(next.dueDate)}</p>
              </div>
              <p className="max-w-[8rem] shrink-0 truncate text-right text-lg font-black text-foreground">{formatCurrency(next.amount)}</p>
            </div>
            <p className="mt-3 rounded-2xl bg-white/80 px-3 py-2 text-sm font-bold text-teal-800">
              {next.daysLeft < 0 ? "Pago vencido" : next.daysLeft === 0 ? "Vence hoy" : `Faltan ${next.daysLeft} días`}
            </p>
          </div>
          <Button asChild variant="outline" className="mt-4 w-full">
            <Link to="/fixed-expenses">
              Gestionar pagos
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      ) : (
        <div className="mt-5 rounded-[1.25rem] bg-emerald-50 p-4 text-emerald-800">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          <p className="mt-2 text-sm font-black">No hay pagos fijos pendientes este mes.</p>
        </div>
      )}
    </Card>
  );
}

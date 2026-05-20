import { Link } from "react-router-dom";
import { ArrowDownLeft, ArrowRight, ArrowUpRight, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatSignedCurrency, formatTransactionDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { DashboardSummary } from "@/types/dashboard";

type RecentMovementsCardProps = {
  summary: DashboardSummary;
};

export function RecentMovementsCard({ summary }: RecentMovementsCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase tracking-normal text-primary">Movimientos</p>
          <h2 className="mt-1 text-lg font-black tracking-normal text-foreground">Recientes</h2>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-primary">
          <ReceiptText className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-4 divide-y divide-border/70">
        {summary.recentMovements.length > 0 ? (
          summary.recentMovements.slice(0, 5).map((movement) => {
            const isIncome = movement.type === "income";
            const Icon = isIncome ? ArrowUpRight : ArrowDownLeft;

            return (
              <article key={movement.id} className="flex min-w-0 items-start gap-3 py-4">
                <div className={cn("mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl", isIncome ? "bg-emerald-100 text-emerald-700" : "bg-teal-100 text-teal-700")}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-foreground">{movement.description}</p>
                      <p className="mt-1 truncate text-sm font-semibold text-muted-foreground">
                        {movement.categoryName} · {formatTransactionDate(movement.date)}
                      </p>
                    </div>
                    <p className={cn("shrink-0 text-right text-sm font-black", isIncome ? "text-emerald-600" : "text-foreground")}>
                      {formatSignedCurrency(movement.amount, movement.type)}
                    </p>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="py-6 text-center">
            <p className="text-sm font-black text-foreground">Aún no hay movimientos</p>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">Registra el primero para ver tu actividad aquí.</p>
            <Button asChild className="mt-4">
              <Link to="/new">Nuevo movimiento</Link>
            </Button>
          </div>
        )}
      </div>

      <Link to="/history" className="mt-3 flex items-center justify-between rounded-2xl bg-teal-50/70 px-3 py-3 text-sm font-black text-primary">
        Ver historial
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </Card>
  );
}

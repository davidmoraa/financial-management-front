import { Link } from "react-router-dom";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import type { Transaction } from "@/types/finance";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TransactionItem } from "@/components/transactions/TransactionItem";
import { formatSignedCurrency, formatTransactionDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { DashboardRecentMovement } from "@/lib/dashboard/dashboardSummaryAdapter";

type RecentTransactionsProps = {
  transactions?: Transaction[];
  movements?: DashboardRecentMovement[];
};

export function RecentTransactions({ transactions = [], movements }: RecentTransactionsProps) {
  const dashboardMovements = movements ?? [];
  const hasItems = transactions.length > 0 || dashboardMovements.length > 0;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-normal text-foreground">Últimos movimientos</h2>
          <p className="mt-1 text-sm font-medium text-muted-foreground">Lo más reciente de tu mes.</p>
        </div>
        <Link to="/history" className="text-sm font-bold text-primary hover:text-teal-700">
          Ver todo
        </Link>
      </div>

      <div className="mt-4 divide-y divide-border/70">
        {hasItems ? (
          dashboardMovements.length > 0 ? (
            dashboardMovements.map((movement) => <DashboardMovementItem key={movement.id} movement={movement} />)
          ) : (
            transactions.map((transaction) => <TransactionItem key={transaction.id} transaction={transaction} />)
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm font-semibold text-foreground">Aún no hay movimientos</p>
            <p className="mt-1 text-sm text-muted-foreground">Registra el primero para ver tu actividad aquí.</p>
            <Button asChild className="mt-4">
              <Link to="/new">Nuevo movimiento</Link>
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

function DashboardMovementItem({ movement }: { movement: DashboardRecentMovement }) {
  const isIncome = movement.type === "income";
  const Icon = isIncome ? ArrowUpRight : ArrowDownLeft;

  return (
    <article className="flex items-start gap-3 py-4">
      <div
        className={cn(
          "mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
          isIncome ? "bg-emerald-100 text-emerald-700" : "bg-teal-100 text-teal-700",
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground">{movement.description}</p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              {movement.categoryName} · {formatTransactionDate(movement.date)}
            </p>
            {movement.note && <p className="mt-1 line-clamp-2 text-sm text-foreground">{movement.note}</p>}
          </div>

          <p className={cn("shrink-0 text-right text-base font-bold tracking-normal", isIncome ? "text-emerald-600" : "text-foreground")}>
            {formatSignedCurrency(movement.amount, movement.type)}
          </p>
        </div>
      </div>
    </article>
  );
}

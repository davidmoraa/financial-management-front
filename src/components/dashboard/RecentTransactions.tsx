import { Link } from "react-router-dom";
import type { Transaction } from "@/types/finance";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TransactionItem } from "@/components/transactions/TransactionItem";

type RecentTransactionsProps = {
  transactions: Transaction[];
};

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
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
        {transactions.length > 0 ? (
          transactions.map((transaction) => <TransactionItem key={transaction.id} transaction={transaction} />)
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

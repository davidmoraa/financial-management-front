import type { Transaction } from "@/types/finance";
import { Card } from "@/components/ui/card";
import { TransactionItem } from "@/components/transactions/TransactionItem";

type TransactionListProps = {
  transactions: Transaction[];
  emptyTitle?: string;
  emptyDescription?: string;
};

export function TransactionList({
  transactions,
  emptyTitle = "No hay movimientos",
  emptyDescription = "Cuando registres actividad, aparecerá aquí.",
}: TransactionListProps) {
  return (
    <Card className="p-5">
      {transactions.length > 0 ? (
        <div className="divide-y divide-border/70">
          {transactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </div>
      ) : (
        <div className="py-10 text-center">
          <p className="text-sm font-bold text-foreground">{emptyTitle}</p>
          <p className="mt-1 text-sm text-muted-foreground">{emptyDescription}</p>
        </div>
      )}
    </Card>
  );
}

import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import type { SyncStatus, Transaction } from "@/types/finance";
import { CategoryBadge } from "@/components/categories/CategoryBadge";
import { Badge } from "@/components/ui/badge";
import { formatSignedCurrency, formatTransactionDate, paymentMethodLabels } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { useCategoryStore } from "@/stores/categoryStore";

type TransactionItemProps = {
  transaction: Transaction;
};

export function TransactionItem({ transaction }: TransactionItemProps) {
  const category = useCategoryStore((state) => state.getCategoryById(transaction.categoryId));
  const isIncome = transaction.type === "income";
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
            {category ? (
              <CategoryBadge category={category} className="max-w-full" />
            ) : (
              <Badge tone={isIncome ? "income" : "expense"}>{transaction.categoryName}</Badge>
            )}
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              {formatTransactionDate(transaction.transactionDate)} · {paymentMethodLabels[transaction.paymentMethod]}
            </p>
            <SyncStateLabel status={transaction.syncStatus} />
            {transaction.note && <p className="mt-1 line-clamp-2 text-sm text-foreground">{transaction.note}</p>}
          </div>

          <p className={cn("shrink-0 text-right text-base font-bold tracking-normal", isIncome ? "text-emerald-600" : "text-foreground")}>
            {formatSignedCurrency(transaction.amount, transaction.type)}
          </p>
        </div>
      </div>
    </article>
  );
}

function SyncStateLabel({ status }: { status: SyncStatus }) {
  const label = {
    synced: "Respaldado",
    pending: "Por subir",
    syncing: "Subiendo...",
    failed: "No se pudo subir",
    conflict: "Revisar conflicto",
  }[status];

  const className = {
    synced: "text-teal-600",
    pending: "text-amber-600",
    syncing: "text-lime-700",
    failed: "text-red-600",
    conflict: "text-purple-700",
  }[status];

  return <p className={cn("mt-1 text-xs font-bold", className)}>{label}</p>;
}

import { useMemo, useState } from "react";
import { format, isSameMonth, parseISO } from "date-fns";
import { SlidersHorizontal } from "lucide-react";
import { TransactionList } from "@/components/transactions/TransactionList";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SyncStatusBadge } from "@/components/sync/SyncStatusBadge";
import { useCategoryStore } from "@/stores/categoryStore";
import { useTransactionStore } from "@/stores/transactionStore";
import type { TransactionType } from "@/types/finance";
import { cn } from "@/lib/utils";

type TypeFilter = "all" | TransactionType;
type SyncFilter = "all" | "synced" | "pending" | "failed";

const typeFilters: Array<{ value: TypeFilter; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "income", label: "Ingresos" },
  { value: "expense", label: "Gastos" },
];

export function HistoryPage() {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [syncFilter, setSyncFilter] = useState<SyncFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [month, setMonth] = useState(() => format(new Date(), "yyyy-MM"));
  const categories = useCategoryStore((state) => state.categories);
  const transactions = useTransactionStore((state) => state.transactions);
  const monthDate = useMemo(() => new Date(`${month}-01T00:00:00`), [month]);
  const monthTransactions = useMemo(
    () =>
      transactions
        .filter((transaction) => !transaction.deletedAt && isSameMonth(parseISO(transaction.transactionDate), monthDate))
        .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()),
    [monthDate, transactions],
  );

  const visibleCategories = categories.filter((category) => typeFilter === "all" || category.type === typeFilter);
  const filteredTransactions = monthTransactions.filter((transaction) => {
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;
    const matchesCategory = categoryFilter === "all" || transaction.categoryId === categoryFilter;
    const matchesSync =
      syncFilter === "all" ||
      transaction.syncStatus === syncFilter ||
      (syncFilter === "pending" && transaction.syncStatus === "syncing");
    return matchesType && matchesCategory && matchesSync;
  });
  const hasTransactions = transactions.some((transaction) => !transaction.deletedAt);

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="mb-4">
          <SyncStatusBadge />
        </div>
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-teal-100 text-primary">
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-normal text-foreground">Filtros</h2>
            <p className="text-sm text-muted-foreground">Estructura inicial para explorar movimientos.</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_1.2fr]">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <div className="grid grid-cols-3 gap-2 rounded-2xl bg-teal-50 p-1">
              {typeFilters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => {
                    setTypeFilter(filter.value);
                    setCategoryFilter("all");
                  }}
                  className={cn(
                    "h-10 rounded-xl text-sm font-bold transition",
                    typeFilter === filter.value ? "bg-white text-primary shadow-soft" : "text-muted-foreground",
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Sync</Label>
            <div className="grid grid-cols-4 gap-1 rounded-2xl bg-teal-50 p-1">
              {(["all", "synced", "pending", "failed"] as SyncFilter[]).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setSyncFilter(filter)}
                  className={cn(
                    "h-10 rounded-xl px-1 text-xs font-bold transition",
                    syncFilter === filter ? "bg-white text-primary shadow-soft" : "text-muted-foreground",
                  )}
                >
                  {filter === "all" ? "Todos" : filter === "synced" ? "Sync" : filter === "pending" ? "Pend." : "Error"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="historyMonth">Mes</Label>
            <input
              id="historyMonth"
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              className="h-12 w-full rounded-2xl border border-input bg-white/85 px-4 text-sm font-semibold outline-none focus:border-primary focus:ring-4 focus:ring-teal-100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryFilter">Categoría</Label>
            <select
              id="categoryFilter"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="h-12 w-full rounded-2xl border border-input bg-white/85 px-4 text-sm font-semibold outline-none focus:border-primary focus:ring-4 focus:ring-teal-100"
            >
              <option value="all">Todas las categorías</option>
              {visibleCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <TransactionList
        transactions={filteredTransactions}
        emptyTitle={hasTransactions ? "Sin movimientos para estos filtros" : "Todavía no hay movimientos."}
        emptyDescription={hasTransactions ? "Cambia el mes, tipo o categoría para revisar otra vista." : "Registra un movimiento para empezar tu historial."}
      />
    </div>
  );
}

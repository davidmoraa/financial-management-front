import { Link } from "react-router-dom";
import { useMemo } from "react";
import { isSameMonth, parseISO } from "date-fns";
import { ArrowRight, Plus, TrendingDown, TrendingUp } from "lucide-react";
import { BalanceOverviewCard } from "@/components/dashboard/BalanceOverviewCard";
import { MonthlyMetricCard } from "@/components/dashboard/MonthlyMetricCard";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { SpendingProgressCard } from "@/components/dashboard/SpendingProgressCard";
import { Button } from "@/components/ui/button";
import { useTransactionStore } from "@/stores/transactionStore";
import { formatShortDate } from "@/lib/formatters";

export function DashboardPage() {
  const currentDate = useMemo(() => new Date(), []);
  const transactions = useTransactionStore((state) => state.transactions);
  const monthlyBudget = useTransactionStore((state) => state.monthlyBudget);

  const monthTransactions = useMemo(
    () => transactions.filter((transaction) => isSameMonth(parseISO(transaction.transactionDate), currentDate)),
    [currentDate, transactions],
  );

  const summary = useMemo(() => {
    const income = monthTransactions
      .filter((transaction) => transaction.type === "income")
      .reduce((total, transaction) => total + transaction.amount, 0);
    const expense = monthTransactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((total, transaction) => total + transaction.amount, 0);

    return {
      income,
      expense,
      balance: income - expense,
      budget: monthlyBudget,
      budgetUsedPercentage: monthlyBudget > 0 ? Math.round((expense / monthlyBudget) * 100) : 0,
    };
  }, [monthTransactions, monthlyBudget]);

  const recentTransactions = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
        .slice(0, 5),
    [transactions],
  );

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 rounded-[1.6rem] bg-white/60 p-4 shadow-soft md:flex-row md:items-center md:justify-between md:p-5">
        <div>
          <p className="text-sm font-bold uppercase tracking-normal text-primary">{formatShortDate(currentDate)}</p>
          <h2 className="mt-1 text-2xl font-bold tracking-normal text-foreground">Registra hoy, decide con calma.</h2>
        </div>
        <Button asChild size="lg" className="w-full md:w-auto">
          <Link to="/new">
            <Plus className="h-5 w-5" aria-hidden="true" />
            Nuevo movimiento
          </Link>
        </Button>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <BalanceOverviewCard balance={summary.balance} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <MonthlyMetricCard label="Ingresos del mes" amount={summary.income} icon={TrendingUp} variant="income" />
          <MonthlyMetricCard label="Gastos del mes" amount={summary.expense} icon={TrendingDown} variant="expense" />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <SpendingProgressCard expense={summary.expense} budget={summary.budget} percentage={summary.budgetUsedPercentage} />
        <RecentTransactions transactions={recentTransactions} />
      </section>

      <Link
        to="/history"
        className="flex items-center justify-between rounded-[1.4rem] border border-teal-100 bg-teal-50/70 px-5 py-4 text-sm font-bold text-teal-800 transition hover:bg-teal-50"
      >
        Ver historial completo
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

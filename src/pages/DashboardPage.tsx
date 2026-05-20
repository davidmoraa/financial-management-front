import { Link } from "react-router-dom";
import { useMemo } from "react";
import { AlertTriangle, ArrowRight, CalendarClock, LoaderCircle, Plus, TrendingDown, TrendingUp } from "lucide-react";
import { BalanceOverviewCard } from "@/components/dashboard/BalanceOverviewCard";
import { MoneyFluxLogo } from "@/components/brand/MoneyFluxLogo";
import { BudgetForecastCard } from "@/components/dashboard/BudgetForecastCard";
import { BudgetWarningsCard } from "@/components/dashboard/BudgetWarningsCard";
import { FixedExpensesThisMonth } from "@/components/dashboard/FixedExpensesThisMonth";
import { FinancialPieChartsCard } from "@/components/dashboard/FinancialPieChartsCard";
import { MonthlyMetricCard } from "@/components/dashboard/MonthlyMetricCard";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { SpendingProgressCard } from "@/components/dashboard/SpendingProgressCard";
import { Button } from "@/components/ui/button";
import { formatShortDate } from "@/lib/formatters";
import { useDashboardSummary } from "@/hooks/useDashboardSummary";
import { adaptDashboardSummary, getDashboardMonthKey, isDashboardSummaryEmpty } from "@/lib/dashboard/dashboardSummaryAdapter";

export function DashboardPage() {
  const currentDate = useMemo(() => new Date(), []);
  const month = useMemo(() => getDashboardMonthKey(currentDate), [currentDate]);
  const { data: dashboardSummary, error, isLoading } = useDashboardSummary(month);
  const adaptedDashboard = useMemo(
    () => (dashboardSummary ? adaptDashboardSummary(dashboardSummary) : undefined),
    [dashboardSummary],
  );
  const hasFinancialData = dashboardSummary ? !isDashboardSummaryEmpty(dashboardSummary) : false;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 rounded-[1.6rem] bg-white/60 p-4 shadow-soft md:flex-row md:items-center md:justify-between md:p-5">
        <div className="flex min-w-0 items-center gap-3">
          <MoneyFluxLogo size="lg" className="hidden sm:block" />
          <div className="min-w-0">
            <p className="text-sm font-bold uppercase tracking-normal text-primary">{formatShortDate(currentDate)}</p>
            <h2 className="mt-1 text-2xl font-bold tracking-normal text-foreground">Registra hoy, decide con calma.</h2>
          </div>
        </div>
        <Button asChild size="lg" className="w-full md:w-auto">
          <Link to="/new">
            <Plus className="h-5 w-5" aria-hidden="true" />
            Nuevo movimiento
          </Link>
        </Button>
      </section>

      {isLoading && !adaptedDashboard && (
        <div className="rounded-2xl bg-white/75 px-4 py-3 text-sm font-semibold text-muted-foreground shadow-soft">
          <span className="inline-flex items-center gap-2">
            <LoaderCircle className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
            Cargando command center...
          </span>
        </div>
      )}

      {error && (
        <section className="rounded-[1.6rem] border border-red-100 bg-red-50 p-5 shadow-soft">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
            <div>
              <h2 className="text-lg font-bold tracking-normal text-red-950">No pudimos cargar tu resumen financiero</h2>
              <p className="mt-1 text-sm font-semibold leading-6 text-red-700">
                Revisa tu conexión o intenta de nuevo. Tus registros locales no se borran.
              </p>
            </div>
          </div>
        </section>
      )}

      {dashboardSummary && !hasFinancialData && (
        <section className="rounded-[1.6rem] border border-teal-100 bg-white p-5 shadow-soft">
          <h2 className="text-xl font-bold tracking-normal text-foreground">Aún no tienes movimientos registrados.</h2>
          <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
            Registra tu primer movimiento o agrega un gasto fijo para empezar a ver proyecciones útiles.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Button asChild>
              <Link to="/new">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Registrar primer movimiento
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/fixed-expenses">
                <CalendarClock className="h-4 w-4" aria-hidden="true" />
                Agregar gasto fijo
              </Link>
            </Button>
          </div>
        </section>
      )}

      {adaptedDashboard && (
        <>
          <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <BalanceOverviewCard balance={adaptedDashboard.monthlySummary.balance} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <MonthlyMetricCard
                label={adaptedDashboard.monthlySummary.expectedIncome > adaptedDashboard.monthlySummary.actualIncome ? "Ingreso esperado del mes" : "Ingresos del mes"}
                amount={adaptedDashboard.monthlySummary.income}
                icon={TrendingUp}
                variant="income"
              />
              <MonthlyMetricCard label="Gastos del mes" amount={adaptedDashboard.monthlySummary.expense} icon={TrendingDown} variant="expense" />
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <SpendingProgressCard
              expense={adaptedDashboard.monthlySummary.expense}
              budget={adaptedDashboard.monthlySummary.budget}
              percentage={adaptedDashboard.monthlySummary.budgetUsedPercentage}
            />
            <RecentTransactions movements={adaptedDashboard.recentMovements} />
          </section>

          <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <BudgetForecastCard monthlyBudget={adaptedDashboard.monthlySummary.budget} forecast={adaptedDashboard.forecast} />
            <div className="grid gap-4">
              <BudgetWarningsCard warnings={adaptedDashboard.forecast.warnings} />
              <FixedExpensesThisMonth forecast={adaptedDashboard.forecast} />
            </div>
          </section>

          <FinancialPieChartsCard
            income={adaptedDashboard.monthlySummary.income}
            actualIncome={adaptedDashboard.monthlySummary.actualIncome}
            expense={adaptedDashboard.monthlySummary.expense}
            forecast={adaptedDashboard.forecast}
          />
        </>
      )}

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

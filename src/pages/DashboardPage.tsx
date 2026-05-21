import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { AlertTriangle, CalendarClock, LoaderCircle, Plus } from "lucide-react";
import { CashflowProjectionCard } from "@/components/dashboard/CashflowProjectionCard";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardPeriodSelector } from "@/components/dashboard/DashboardPeriodSelector";
import { FinancialStatusHero } from "@/components/dashboard/FinancialStatusHero";
import { FinancialStreakCard } from "@/components/dashboard/FinancialStreakCard";
import { MonthlyRhythmCard } from "@/components/dashboard/MonthlyRhythmCard";
import { RecentMovementsCard } from "@/components/dashboard/RecentMovementsCard";
import { RecommendedActionCard } from "@/components/dashboard/RecommendedActionCard";
import { SafeToSpendCard } from "@/components/dashboard/SafeToSpendCard";
import { UpcomingFixedExpenseCard } from "@/components/dashboard/UpcomingFixedExpenseCard";
import { WatchCategoriesCard } from "@/components/dashboard/WatchCategoriesCard";
import { Button } from "@/components/ui/button";
import { useDashboardSummary } from "@/hooks/useDashboardSummary";
import { getDashboardPeriod } from "@/lib/dashboard/dashboardPeriod";
import { getDashboardMonthKey, isDashboardSummaryEmpty } from "@/lib/dashboard/dashboardSummaryAdapter";
import type { DashboardPeriodType } from "@/types/dashboard";

export function DashboardPage() {
  const currentDate = useMemo(() => new Date(), []);
  const [periodType, setPeriodType] = useState<DashboardPeriodType>("monthly");
  const month = useMemo(() => getDashboardMonthKey(currentDate), [currentDate]);
  const period = useMemo(() => getDashboardPeriod(periodType, currentDate), [currentDate, periodType]);
  const { data: dashboardSummary, error, isLoading } = useDashboardSummary(month, period);
  const isEmpty = dashboardSummary ? isDashboardSummaryEmpty(dashboardSummary) : false;

  return (
    <div className="space-y-5 md:space-y-6">
      <DashboardHeader currentDate={currentDate} />
      <DashboardPeriodSelector value={periodType} period={period} onChange={setPeriodType} />

      {isLoading && !dashboardSummary && <DashboardLoadingState />}

      {error && <DashboardErrorState />}

      {dashboardSummary && isEmpty && <DashboardEmptyState />}

      {dashboardSummary && !isEmpty && (
        <>
          <FinancialStatusHero summary={dashboardSummary} />

          <section className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
            <div className="grid min-w-0 gap-4">
              <SafeToSpendCard summary={dashboardSummary} />
              <CashflowProjectionCard summary={dashboardSummary} />
              <WatchCategoriesCard summary={dashboardSummary} />
              <RecentMovementsCard summary={dashboardSummary} />
            </div>

            <div className="grid min-w-0 content-start gap-4">
              <RecommendedActionCard summary={dashboardSummary} />
              <UpcomingFixedExpenseCard summary={dashboardSummary} />
              <MonthlyRhythmCard summary={dashboardSummary} />
              <FinancialStreakCard summary={dashboardSummary} />
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function DashboardLoadingState() {
  return (
    <section className="rounded-[1.6rem] border border-teal-100 bg-white/78 p-5 shadow-soft">
      <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground">
        <LoaderCircle className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
        Cargando command center...
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="h-28 rounded-3xl bg-teal-50/80" />
        <div className="h-28 rounded-3xl bg-teal-50/80" />
        <div className="h-28 rounded-3xl bg-teal-50/80" />
      </div>
    </section>
  );
}

function DashboardErrorState() {
  return (
    <section className="rounded-[1.6rem] border border-red-100 bg-red-50 p-5 shadow-soft">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
        <div>
          <h2 className="text-lg font-black tracking-normal text-red-950">No pudimos cargar tu resumen financiero</h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-red-700">
            Revisa tu conexión o intenta de nuevo. Tus registros locales no se borran.
          </p>
        </div>
      </div>
    </section>
  );
}

function DashboardEmptyState() {
  return (
    <section className="rounded-[1.6rem] border border-teal-100 bg-white p-5 shadow-soft md:p-6">
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div className="min-w-0">
          <p className="text-sm font-black uppercase tracking-normal text-primary">Primer registro</p>
          <h2 className="mt-2 text-2xl font-black tracking-normal text-foreground">Aún no tienes movimientos registrados.</h2>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-muted-foreground">
            Registra tu primer movimiento o agrega un gasto fijo para activar tu Command Center con datos reales.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 md:w-80 md:grid-cols-1">
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
      </div>
    </section>
  );
}

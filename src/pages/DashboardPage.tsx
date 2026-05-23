import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { AlertTriangle, CalendarClock, Plus } from "lucide-react";
import { ActiveSavingMilestonesCard } from "@/components/dashboard/ActiveSavingMilestonesCard";
import { CashflowProjectionCard } from "@/components/dashboard/CashflowProjectionCard";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { FinancialPeriodControl } from "@/components/dashboard/FinancialPeriodControl";
import { FinancialPulseSection } from "@/components/dashboard/FinancialPulseSection";
import { FinancialStatusHero } from "@/components/dashboard/FinancialStatusHero";
import { FinancialInsightsCard } from "@/components/dashboard/FinancialInsightsCard";
import { ProjectionSimulatorCard } from "@/components/dashboard/ProjectionSimulatorCard";
import { RecentMovementsCard } from "@/components/dashboard/RecentMovementsCard";
import { RecommendedActionCard } from "@/components/dashboard/RecommendedActionCard";
import { SafeToSpendExplanation } from "@/components/dashboard/SafeToSpendExplanation";
import { UpcomingFixedExpenseCard } from "@/components/dashboard/UpcomingFixedExpenseCard";
import { UpcomingObligationsCard } from "@/components/dashboard/UpcomingObligationsCard";
import { WatchCategoriesCard } from "@/components/dashboard/WatchCategoriesCard";
import { Button } from "@/components/ui/button";
import { useDashboardSummary } from "@/hooks/useDashboardSummary";
import { getDashboardPeriod } from "@/lib/dashboard/dashboardPeriod";
import { getDashboardMonthKey, isDashboardSummaryEmpty } from "@/lib/dashboard/dashboardSummaryAdapter";
import { useSavingMilestoneStore } from "@/stores/savingMilestoneStore";
import type { DashboardPeriodType } from "@/types/dashboard";

export function DashboardPage() {
  const currentDate = useMemo(() => new Date(), []);
  const [periodType, setPeriodType] = useState<DashboardPeriodType>("monthly");
  const month = useMemo(() => getDashboardMonthKey(currentDate), [currentDate]);
  const period = useMemo(() => getDashboardPeriod(periodType, currentDate), [currentDate, periodType]);
  const { data: dashboardSummary, error, isLoading } = useDashboardSummary(month, period);
  const savingMilestones = useSavingMilestoneStore((state) => state.savingMilestones);
  const hydrateSavingMilestones = useSavingMilestoneStore((state) => state.hydrate);
  const isLoadingSavingMilestones = useSavingMilestoneStore((state) => state.isLoading);
  const isEmpty = dashboardSummary ? isDashboardSummaryEmpty(dashboardSummary) : false;
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    void hydrateSavingMilestones();
  }, [hydrateSavingMilestones]);

  return (
    <div className="space-y-5 md:space-y-6">
      <FinancialPeriodControl
        currentDate={currentDate}
        value={periodType}
        period={period}
        onChange={setPeriodType}
        summary={dashboardSummary}
      />

      {isLoading && !dashboardSummary && <DashboardSkeleton />}

      {error && <DashboardErrorState hasData={Boolean(dashboardSummary)} />}

      {dashboardSummary && isEmpty && <DashboardEmptyState />}

      {dashboardSummary && !isEmpty && (
        <motion.div
          key={`${dashboardSummary.balance.status}-${period.type}`}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="space-y-5 md:space-y-6"
        >
          <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.65fr)] xl:items-stretch">
            <FinancialStatusHero summary={dashboardSummary} />
            <RecommendedActionCard summary={dashboardSummary} />
          </section>

          <FinancialPulseSection summary={dashboardSummary} />

          <section className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
            <div className="grid min-w-0 content-start gap-4">
              <SafeToSpendExplanation summary={dashboardSummary} />
              <ProjectionSimulatorCard currentDate={currentDate} summary={dashboardSummary} />
              <UpcomingFixedExpenseCard summary={dashboardSummary} />
              <UpcomingObligationsCard summary={dashboardSummary} />
              <ActiveSavingMilestonesCard
                milestones={savingMilestones}
                isLoading={isLoadingSavingMilestones}
              />
              <FinancialInsightsCard summary={dashboardSummary} />
            </div>

            <div className="grid min-w-0 gap-4">
              <CashflowProjectionCard summary={dashboardSummary} />
              <WatchCategoriesCard summary={dashboardSummary} />
              <RecentMovementsCard summary={dashboardSummary} />
            </div>
          </section>
        </motion.div>
      )}
    </div>
  );
}

function DashboardErrorState({ hasData = false }: { hasData?: boolean }) {
  return (
    <section className="rounded-[1.6rem] border border-red-100 bg-red-50 p-5 shadow-soft">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
        <div>
          <h2 className="text-lg font-black tracking-normal text-red-950">
            {hasData ? "No pudimos actualizar tu resumen financiero" : "No pudimos cargar tu resumen financiero"}
          </h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-red-700">
            {hasData
              ? "Mostramos los datos disponibles en este dispositivo. Intenta sincronizar de nuevo cuando tengas conexión."
              : "Revisa tu conexión o intenta de nuevo. Tus registros locales no se borran."}
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

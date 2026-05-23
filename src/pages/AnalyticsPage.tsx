import { format } from "date-fns";
import { BarChart3, RefreshCw } from "lucide-react";
import {
  AnalyticsInsightsPanel,
  CashflowProjectionChart,
  CategoryBudgetProgress,
  CreditCardAnalytics,
  DailySpendingHeatmap,
  FixedVsVariableChart,
  IncomeVsExpenseTrend,
  MoneyLeaksPanel,
  MonthlySpendingPace,
  SavingsMilestonesAnalytics,
  SpendingByCategoryChart,
  UpcomingObligationsTimeline,
} from "@/components/analytics/AnalyticsCharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAnalyticsSummary } from "@/hooks/useAnalyticsSummary";
import { formatCurrency } from "@/lib/formatters";

export function AnalyticsPage() {
  const period = format(new Date(), "yyyy-MM");
  const { data, error, isLoading } = useAnalyticsSummary(period);
  const isEmpty = data ? isAnalyticsEmpty(data) : false;

  if (isLoading && !data) {
    return <AnalyticsLoadingState />;
  }

  if (error && !data) {
    return <AnalyticsErrorState />;
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-5 md:space-y-6">
      <section className="rounded-[1.6rem] border border-teal-100 bg-white/88 p-5 shadow-soft backdrop-blur md:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="min-w-0">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">Análisis financiero</p>
            <h2 className="mt-2 text-3xl font-black tracking-normal text-foreground md:text-4xl">
              Señales para decidir mejor.
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-muted-foreground md:text-base">
              Cada gráfica conecta tus datos reales con una acción concreta para cuidar tu ritmo, tus pagos y tus metas.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-[1.4rem] border border-teal-100 bg-teal-50/70 p-3 text-center">
            <OverviewMetric label="Ingresos" value={data.overview.income} />
            <OverviewMetric label="Gastos" value={data.overview.expenses} />
            <OverviewMetric label="Ahorro neto" value={data.overview.netSavings} />
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-[1.25rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">
          Mostramos el último análisis disponible. No pudimos actualizarlo ahora.
        </div>
      ) : null}

      {isEmpty ? <AnalyticsEmptyState /> : null}

      <section className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="grid min-w-0 content-start gap-4">
          <AnalyticsInsightsPanel insights={data.insights} />
          <MonthlySpendingPace pace={data.spendingPace} />
          <SpendingByCategoryChart items={data.spendingByCategory} />
          <CategoryBudgetProgress items={data.categoryBudgetProgress} />
          <FixedVsVariableChart data={data.fixedVsVariable} />
          <UpcomingObligationsTimeline items={data.upcomingObligations} />
        </div>

        <div className="grid min-w-0 content-start gap-4">
          <CashflowProjectionChart items={data.cashflowProjection} />
          <DailySpendingHeatmap items={data.dailyHeatmap} />
          <IncomeVsExpenseTrend items={data.monthlyTrend} />
          <MoneyLeaksPanel items={data.moneyLeaks} />
          <SavingsMilestonesAnalytics items={data.savingsMilestones} />
          <CreditCardAnalytics items={data.creditCards} />
        </div>
      </section>
    </div>
  );
}

function OverviewMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0 rounded-2xl bg-white/80 px-3 py-3 ring-1 ring-white/80">
      <p className="truncate text-[11px] font-black uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-black text-foreground md:text-base">{formatCurrency(value)}</p>
    </div>
  );
}

function AnalyticsLoadingState() {
  return (
    <div className="space-y-4" role="status" aria-label="Cargando análisis financiero">
      <div className="h-40 animate-pulse rounded-[1.6rem] bg-white/75 shadow-soft" />
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-64 animate-pulse rounded-[1.6rem] bg-white/70 shadow-soft" />
        ))}
      </div>
    </div>
  );
}

function AnalyticsErrorState() {
  return (
    <Card className="p-5 md:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-700">
          <RefreshCw className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-black tracking-normal text-foreground">No pudimos cargar tu análisis</h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-muted-foreground">
            Revisa tu conexión e intenta de nuevo. Tus datos locales se mantienen guardados.
          </p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    </Card>
  );
}

function AnalyticsEmptyState() {
  return (
    <Card className="p-5 md:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-primary">
          <BarChart3 className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-black tracking-normal text-foreground">Aún no hay suficientes datos para analizar.</h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-muted-foreground">
            Registra movimientos, gastos fijos, tarjetas o metas para convertir tus datos en señales accionables.
          </p>
        </div>
      </div>
    </Card>
  );
}

function isAnalyticsEmpty(data: {
  overview: { income: number; expenses: number; netSavings: number };
  spendingByCategory: unknown[];
  upcomingObligations: unknown[];
  savingsMilestones: unknown[];
  creditCards: unknown[];
}) {
  return (
    data.overview.income === 0 &&
    data.overview.expenses === 0 &&
    data.overview.netSavings === 0 &&
    data.spendingByCategory.length === 0 &&
    data.upcomingObligations.length === 0 &&
    data.savingsMilestones.length === 0 &&
    data.creditCards.length === 0
  );
}

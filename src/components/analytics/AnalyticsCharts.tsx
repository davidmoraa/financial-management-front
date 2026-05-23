import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CalendarClock,
  CreditCard,
  Flame,
  LineChart,
  PiggyBank,
  Target,
  TrendingUp,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatTransactionDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { AnalyticsSummary } from "@/types/analytics";

const chartColors = ["#0f766e", "#14b8a6", "#84cc16", "#0ea5e9", "#f59e0b", "#94a3b8"];

export function AnalyticsInsightsPanel({ insights }: { insights: AnalyticsSummary["insights"] }) {
  const items = insights.length > 0 ? insights : [{
    id: "empty",
    severity: "info" as const,
    title: "Aún no hay señales suficientes",
    description: "Registra movimientos para generar diagnósticos más útiles.",
    suggestedAction: "Registrar movimiento",
    targetPath: "/new",
  }];

  return (
    <Card className="p-5">
      <SectionHeader
        eyebrow="Señales"
        icon={Flame}
        title="Qué atender primero"
        subtitle="Dato, diagnóstico y siguiente acción en un solo lugar."
      />
      <div className="mt-4 grid gap-3">
        {items.slice(0, 4).map((insight) => (
          <div
            key={insight.id}
            className={cn(
              "rounded-[1.25rem] border p-4",
              insight.severity === "danger" && "border-red-200 bg-red-50 text-red-950",
              insight.severity === "warning" && "border-amber-200 bg-amber-50 text-amber-950",
              insight.severity === "positive" && "border-lime-200 bg-lime-50 text-lime-950",
              insight.severity === "info" && "border-teal-100 bg-teal-50 text-teal-950",
            )}
          >
            <h3 className="text-base font-black tracking-normal">{insight.title}</h3>
            <p className="mt-1 text-sm font-semibold leading-6 opacity-80">{insight.description}</p>
            {insight.suggestedAction && insight.targetPath ? (
              <Link className="mt-3 inline-flex text-sm font-black text-primary underline-offset-4 hover:underline" to={insight.targetPath}>
                {insight.suggestedAction}
              </Link>
            ) : null}
          </div>
        ))}
      </div>
    </Card>
  );
}

export function SpendingByCategoryChart({ items }: { items: AnalyticsSummary["spendingByCategory"] }) {
  const gradient = items.length > 0
    ? `conic-gradient(${items.map((item, index) => {
      const previous = items.slice(0, index).reduce((total, current) => total + current.percentage, 0);
      return `${chartColors[index % chartColors.length]} ${previous}% ${previous + item.percentage}%`;
    }).join(", ")})`
    : "conic-gradient(#ccfbf1 0 100%)";
  const dominant = items[0];

  return (
    <Card className="p-5">
      <SectionHeader eyebrow="Categorías" icon={WalletCards} title="¿En qué se va tu dinero?" />
      {items.length === 0 ? (
        <EmptyAnalyticsState text="Aún no hay gastos para comparar categorías." />
      ) : (
        <div className="mt-5 grid gap-5 sm:grid-cols-[12rem_1fr] sm:items-center">
          <div
            aria-label="Distribución de gasto por categoría"
            className="relative mx-auto h-44 w-44 rounded-full shadow-inner"
            style={{ background: gradient }}
          >
            <div className="absolute inset-8 flex flex-col items-center justify-center rounded-full bg-white text-center shadow-soft">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-primary">Top</span>
              <span className="text-lg font-black text-foreground">{dominant?.categoryName}</span>
            </div>
          </div>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={item.categoryId} className="flex items-center justify-between gap-3 rounded-2xl bg-white/75 px-3 py-2 ring-1 ring-border">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
                  <span className="truncate text-sm font-black text-foreground">{item.categoryName}</span>
                </div>
                <span className="shrink-0 text-sm font-black text-primary">{formatCurrency(item.amount)} · {item.percentage}%</span>
              </div>
            ))}
            {dominant && dominant.percentage >= 45 ? (
              <p className="rounded-2xl bg-lime-50 px-3 py-3 text-sm font-bold leading-6 text-lime-900">
                {dominant.categoryName} concentra {dominant.percentage}% de tus gastos. Revisa si ese peso fue planeado.
              </p>
            ) : null}
          </div>
        </div>
      )}
    </Card>
  );
}

export function CategoryBudgetProgress({ items }: { items: AnalyticsSummary["categoryBudgetProgress"] }) {
  return (
    <Card className="p-5">
      <SectionHeader eyebrow="Riesgo" icon={AlertTriangle} title="¿Qué categorías cuidar?" />
      {items.length === 0 ? (
        <EmptyAnalyticsState text="No hay categorías con gasto en este periodo." />
      ) : (
        <div className="mt-5 space-y-3">
          {items.map((item) => (
            <div key={item.categoryId} className="rounded-[1.25rem] bg-white/75 p-4 ring-1 ring-border">
              <div className="flex items-center justify-between gap-3">
                <p className="min-w-0 truncate text-sm font-black text-foreground">{item.categoryName}</p>
                <span className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 text-xs font-black",
                  item.status === "danger" && "bg-red-100 text-red-700",
                  item.status === "warning" && "bg-amber-100 text-amber-700",
                  item.status === "healthy" && "bg-teal-100 text-primary",
                )}>
                  {item.percentage}%
                </span>
              </div>
              <Progress
                className="mt-3"
                indicatorClassName={cn(item.status === "danger" && "bg-red-500", item.status === "warning" && "bg-amber-500")}
                value={Math.min(100, item.percentage)}
              />
              <div className="mt-2 flex justify-between gap-3 text-xs font-bold text-muted-foreground">
                <span>{formatCurrency(item.spent)}</span>
                <span>de {formatCurrency(item.budget)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export function MonthlySpendingPace({ pace }: { pace: AnalyticsSummary["spendingPace"] }) {
  return (
    <Card className="p-5">
      <SectionHeader eyebrow="Ritmo" icon={TrendingUp} title="¿Vas más rápido de lo planeado?" />
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <PaceMetric label="Ritmo esperado" value={pace.expectedUsagePercentage} />
        <PaceMetric label="Uso real" value={pace.actualUsagePercentage} tone={pace.status === "over_pace" ? "warning" : "normal"} />
      </div>
      <p className={cn(
        "mt-4 rounded-2xl px-4 py-3 text-sm font-bold leading-6",
        pace.status === "over_pace" ? "bg-amber-50 text-amber-900" : "bg-teal-50 text-teal-900",
      )}>
        {pace.message}
      </p>
    </Card>
  );
}

export function CashflowProjectionChart({ items }: { items: AnalyticsSummary["cashflowProjection"] }) {
  const values = items.map((item) => item.projectedBalance);
  const min = Math.min(0, ...values);
  const max = Math.max(1, ...values);
  const points = items.map((item, index) => {
    const x = items.length <= 1 ? 0 : (index / (items.length - 1)) * 100;
    const y = 100 - ((item.projectedBalance - min) / Math.max(1, max - min)) * 86 - 7;
    return `${x},${y}`;
  }).join(" ");

  return (
    <Card className="p-5">
      <SectionHeader eyebrow="Flujo" icon={LineChart} title="¿Cómo se moverá tu dinero?" />
      {items.length === 0 ? (
        <EmptyAnalyticsState text="No hay proyección de flujo para este periodo." />
      ) : (
        <>
          <svg className="mt-5 h-48 w-full overflow-visible" role="img" aria-label="Línea de saldo proyectado" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline fill="none" points={points} stroke="#0f766e" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" vectorEffect="non-scaling-stroke" />
          </svg>
          <div className="mt-3 grid gap-2">
            {items.filter((item) => item.events.length > 0).slice(0, 4).map((item) => (
              <div key={item.date} className="rounded-2xl bg-teal-50/80 px-3 py-2 text-sm font-bold text-teal-900">
                {formatTransactionDate(item.date)} · {item.events.map((event) => event.name).join(", ")}
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}

export function FixedVsVariableChart({ data }: { data: AnalyticsSummary["fixedVsVariable"] }) {
  const items = [
    { label: "Fijos", value: data.fixedExpenses },
    { label: "Variables", value: data.variableExpenses },
    { label: "Metas", value: data.savingsGoals },
    { label: "Tarjetas", value: data.creditCardObligations },
  ];
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="p-5">
      <SectionHeader eyebrow="Compromisos" icon={PiggyBank} title="¿Cuánto ya está comprometido?" />
      {total <= 0 ? (
        <EmptyAnalyticsState text="Aún no hay compromisos o gastos para dividir." />
      ) : (
        <div className="mt-5 space-y-3">
          {items.map((item, index) => (
            <div key={item.label}>
              <div className="mb-1 flex justify-between gap-3 text-sm font-black">
                <span>{item.label}</span>
                <span>{formatCurrency(item.value)}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-teal-50">
                <div className="h-full rounded-full" style={{ width: `${(item.value / total) * 100}%`, backgroundColor: chartColors[index] }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export function UpcomingObligationsTimeline({ items }: { items: AnalyticsSummary["upcomingObligations"] }) {
  return (
    <Card className="p-5">
      <SectionHeader eyebrow="Próximos pagos" icon={CalendarClock} title="¿Qué viene pronto?" />
      {items.length === 0 ? (
        <EmptyAnalyticsState text="No tienes obligaciones próximas en este periodo." />
      ) : (
        <div className="mt-5 space-y-3">
          {items.slice(0, 6).map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 rounded-[1.25rem] bg-white/75 px-4 py-3 ring-1 ring-border">
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-foreground">{item.name}</p>
                <p className="text-xs font-bold text-muted-foreground">{formatTransactionDate(item.dueDate)}</p>
              </div>
              <span className="shrink-0 text-sm font-black text-primary">{formatCurrency(item.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export function DailySpendingHeatmap({ items }: { items: AnalyticsSummary["dailyHeatmap"] }) {
  return (
    <Card className="p-5">
      <SectionHeader eyebrow="Días" icon={CalendarClock} title="¿Qué días gastas más?" />
      <div className="mt-5 grid grid-cols-7 gap-1.5">
        {items.map((item) => (
          <div
            key={item.date}
            aria-label={`${formatTransactionDate(item.date)}: ${formatCurrency(item.amount)}`}
            className={cn(
              "aspect-square rounded-lg border",
              item.intensity === "high" && "border-teal-600 bg-primary",
              item.intensity === "medium" && "border-teal-200 bg-teal-200",
              item.intensity === "low" && "border-teal-50 bg-teal-50",
            )}
            title={`${item.date}: ${formatCurrency(item.amount)}`}
          />
        ))}
      </div>
    </Card>
  );
}

export function IncomeVsExpenseTrend({ items }: { items: AnalyticsSummary["monthlyTrend"] }) {
  const max = Math.max(1, ...items.flatMap((item) => [item.income, item.expenses]));

  return (
    <Card className="p-5">
      <SectionHeader eyebrow="Tendencia" icon={TrendingUp} title="¿Mejoras mes a mes?" />
      <div className="mt-5 flex h-44 items-end gap-3 overflow-hidden">
        {items.map((item) => (
          <div key={item.month} className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <div className="flex h-36 w-full items-end justify-center gap-1">
              <span className="w-3 rounded-t-full bg-primary" style={{ height: `${Math.max(4, (item.income / max) * 100)}%` }} />
              <span className="w-3 rounded-t-full bg-amber-400" style={{ height: `${Math.max(4, (item.expenses / max) * 100)}%` }} />
            </div>
            <span className="truncate text-[10px] font-black uppercase text-muted-foreground">{item.month.slice(5)}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function MoneyLeaksPanel({ items }: { items: AnalyticsSummary["moneyLeaks"] }) {
  return (
    <Card className="p-5">
      <SectionHeader eyebrow="Fugas" icon={AlertTriangle} title="¿Dónde se escapa dinero?" />
      {items.length === 0 ? (
        <EmptyAnalyticsState text="No detectamos fugas claras con los datos actuales." />
      ) : (
        <div className="mt-5 space-y-3">
          {items.map((item) => (
            <div key={`${item.type}-${item.title}`} className="rounded-[1.25rem] bg-amber-50 p-4 text-amber-950">
              <h3 className="font-black">{item.title}</h3>
              <p className="mt-1 text-sm font-semibold leading-6 opacity-80">{item.description}</p>
              <p className="mt-2 text-sm font-black">Impacto estimado: {formatCurrency(item.estimatedMonthlyImpact)}</p>
              <p className="mt-1 text-sm font-bold">{item.suggestedAction}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export function SavingsMilestonesAnalytics({ items }: { items: AnalyticsSummary["savingsMilestones"] }) {
  return (
    <Card className="p-5">
      <SectionHeader eyebrow="Metas" icon={Target} title="¿Llegas a tus objetivos?" />
      {items.length === 0 ? (
        <EmptyAnalyticsState text="Todavía no tienes metas activas." />
      ) : (
        <div className="mt-5 space-y-3">
          {items.slice(0, 4).map((item) => (
            <div key={item.id} className="rounded-[1.25rem] bg-white/75 p-4 ring-1 ring-border">
              <div className="flex justify-between gap-3">
                <h3 className="font-black">{item.name}</h3>
                <span className="text-sm font-black text-primary">{item.progressPercentage}%</span>
              </div>
              <Progress className="mt-3" value={item.progressPercentage} />
              <p className="mt-2 text-sm font-bold text-muted-foreground">
                Para llegar a tiempo, aparta {formatCurrency(item.requiredWeeklyContribution)} por semana.
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export function CreditCardAnalytics({ items }: { items: AnalyticsSummary["creditCards"] }) {
  return (
    <Card className="p-5">
      <SectionHeader eyebrow="Tarjetas" icon={CreditCard} title="¿Qué cuidar de tus cortes?" />
      {items.length === 0 ? (
        <EmptyAnalyticsState text="No tienes tarjetas activas para analizar." />
      ) : (
        <div className="mt-5 grid gap-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-[1.25rem] bg-white/75 p-4 ring-1 ring-border">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-black">{item.name}</h3>
                  <p className="text-sm font-bold text-muted-foreground">Corte {formatTransactionDate(item.statementClosingDate)}</p>
                </div>
                <span className="shrink-0 font-black text-primary">{formatCurrency(item.currentCycleAmount)}</span>
              </div>
              <p className="mt-2 text-sm font-bold text-muted-foreground">Pago límite {formatTransactionDate(item.paymentDueDate)}</p>
              {typeof item.utilizationPercentage === "number" ? (
                <p className="mt-2 text-sm font-black text-foreground">Uso del límite: {item.utilizationPercentage}%</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function PaceMetric({ label, tone = "normal", value }: { label: string; tone?: "normal" | "warning"; value: number }) {
  return (
    <div className={cn("rounded-[1.25rem] p-4", tone === "warning" ? "bg-amber-50 text-amber-900" : "bg-teal-50 text-teal-900")}>
      <p className="text-xs font-black uppercase tracking-[0.12em]">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}%</p>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  icon: Icon,
  subtitle,
  title,
}: {
  eyebrow: string;
  icon: LucideIcon;
  subtitle?: string;
  title: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-primary">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-black tracking-normal text-foreground">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm font-semibold leading-6 text-muted-foreground">{subtitle}</p> : null}
      </div>
    </div>
  );
}

function EmptyAnalyticsState({ text }: { text: string }) {
  return (
    <div className="mt-5 rounded-[1.25rem] bg-teal-50/70 px-4 py-5 text-sm font-bold leading-6 text-teal-900">
      {text}
    </div>
  );
}

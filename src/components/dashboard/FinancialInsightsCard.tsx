import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, CheckCircle2, Info, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { DashboardSummary, FinancialInsight, FinancialInsightSeverity } from "@/types/dashboard";

type FinancialInsightsCardProps = {
  summary: DashboardSummary;
};

const fallbackHealthyInsight: FinancialInsight = {
  id: "healthy-month-fallback",
  type: "healthy_month",
  severity: "positive",
  title: "Mes estable",
  description: "Tu mes se ve estable. Sigue registrando tus movimientos para mantener claridad.",
  priority: 9,
};

export function FinancialInsightsCard({ summary }: FinancialInsightsCardProps) {
  const secondaryInsights = getSecondaryInsights(summary);

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase tracking-normal text-primary">Señales</p>
          <h2 className="mt-1 text-lg font-black tracking-normal text-foreground">Señales de tu mes</h2>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-primary">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {secondaryInsights.map((insight) => (
          <InsightItem key={insight.id} insight={insight} />
        ))}
      </div>
    </Card>
  );
}

function getSecondaryInsights(summary: DashboardSummary) {
  const insights = summary.insights ?? [];

  if (!insights.length) {
    return [fallbackHealthyInsight];
  }

  return insights.slice(1, 4);
}

function InsightItem({ insight }: { insight: FinancialInsight }) {
  const Icon = getInsightIcon(insight.severity);

  return (
    <article className={cn("rounded-[1.25rem] border p-4", insightSurfaceClass(insight.severity))}>
      <div className="flex items-start gap-3">
        <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl", insightIconClass(insight.severity))}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-black text-foreground">{insight.title}</h3>
              <p className="mt-1 text-sm font-semibold leading-6 text-muted-foreground">{insight.description}</p>
            </div>
            {typeof insight.metricValue === "number" && (
              <div className="min-w-0 max-w-[7rem] shrink-0 text-right">
                {insight.metricLabel && <p className="truncate text-[11px] font-bold uppercase tracking-normal text-muted-foreground">{insight.metricLabel}</p>}
                <p className="truncate text-sm font-black text-foreground">{formatInsightMetric(insight)}</p>
              </div>
            )}
          </div>

          {insight.ctaLabel && insight.targetPath && (
            <Link
              to={insight.targetPath}
              className="mt-3 inline-flex items-center gap-2 rounded-lg text-sm font-black text-primary outline-none transition hover:text-teal-700 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {insight.ctaLabel}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

function formatInsightMetric(insight: FinancialInsight) {
  const metricValue = typeof insight.metricValue === "number" && Number.isFinite(insight.metricValue)
    ? insight.metricValue
    : 0;

  if (insight.type === "budget_exceeded" || insight.type === "category_overspending") {
    return `${metricValue}%`;
  }

  if (insight.type === "uncategorized_movements") {
    return String(metricValue);
  }

  return formatCurrency(metricValue);
}

function getInsightIcon(severity: FinancialInsightSeverity) {
  if (severity === "danger" || severity === "warning") {
    return AlertTriangle;
  }
  if (severity === "positive") {
    return CheckCircle2;
  }
  return Info;
}

function insightSurfaceClass(severity: FinancialInsightSeverity) {
  if (severity === "danger") return "border-red-100 bg-red-50/75";
  if (severity === "warning") return "border-amber-100 bg-amber-50/75";
  if (severity === "positive") return "border-emerald-100 bg-emerald-50/75";
  return "border-teal-100 bg-teal-50/75";
}

function insightIconClass(severity: FinancialInsightSeverity) {
  if (severity === "danger") return "bg-red-100 text-red-700";
  if (severity === "warning") return "bg-amber-100 text-amber-700";
  if (severity === "positive") return "bg-emerald-100 text-emerald-700";
  return "bg-teal-100 text-primary";
}

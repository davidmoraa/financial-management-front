import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Lightbulb, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DashboardSummary } from "@/types/dashboard";

type RecommendedActionCardProps = {
  summary: DashboardSummary;
};

export function RecommendedActionCard({ summary }: RecommendedActionCardProps) {
  const action = summary.recommendedAction;
  const title = action?.title ?? "Mantén el registro al día";
  const description = action?.description ?? "Cuando registres cada movimiento al momento, el gasto seguro y las alertas se mantienen precisas.";
  const ctaLabel = action?.ctaLabel ?? "Registrar movimiento";
  const targetPath = action?.targetPath?.trim() || "/new";
  const isHighPriority = action?.priority === "high";

  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-[1.7rem] p-5 shadow-[0_22px_70px_-44px_rgba(15,82,78,0.85)] md:p-6",
        isHighPriority
          ? "border-amber-100 bg-[linear-gradient(135deg,rgba(255,251,235,0.96),rgba(255,255,255,0.88))]"
          : "border-teal-100 bg-[linear-gradient(135deg,rgba(236,253,245,0.92),rgba(255,255,255,0.9))]",
      )}
    >
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/78 px-3 py-1 text-xs font-black uppercase tracking-normal text-primary ring-1 ring-teal-100">
            <Zap className="h-3.5 w-3.5" aria-hidden="true" />
            Acción recomendada
          </p>
          <h2 className="mt-3 text-xl font-black tracking-normal text-foreground md:text-2xl">{title}</h2>
        </div>
        <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-soft", priorityClass(action?.priority))}>
          <Lightbulb className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      <p className="relative mt-4 text-sm font-semibold leading-6 text-muted-foreground md:text-base">
        {description}
      </p>

      <div className="relative mt-5 rounded-[1.25rem] bg-white/72 p-3 ring-1 ring-white/80">
        <div className="flex items-start gap-2 text-sm font-bold leading-6 text-teal-900">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          Una acción concreta mantiene tu proyección útil para decidir mejor hoy.
        </div>
      </div>

      <Button asChild className="relative mt-4 w-full" variant={isHighPriority ? "default" : "outline"}>
        <Link to={targetPath}>
          {ctaLabel}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </Button>
    </Card>
  );
}

function priorityClass(priority?: "low" | "medium" | "high") {
  if (priority === "high") return "bg-amber-100 text-amber-700";
  if (priority === "medium") return "bg-lime-100 text-lime-700";
  return "bg-teal-100 text-primary";
}

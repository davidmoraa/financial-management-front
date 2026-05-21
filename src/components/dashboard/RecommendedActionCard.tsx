import { Link } from "react-router-dom";
import { ArrowRight, Lightbulb } from "lucide-react";
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

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-black uppercase tracking-normal text-primary">Acción recomendada</p>
          <h2 className="mt-1 text-lg font-black tracking-normal text-foreground">{title}</h2>
        </div>
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl", priorityClass(action?.priority))}>
          <Lightbulb className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      <p className="mt-4 text-sm font-semibold leading-6 text-muted-foreground">
        {description}
      </p>

      <Button asChild className="mt-5 w-full" variant={action?.priority === "high" ? "default" : "outline"}>
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

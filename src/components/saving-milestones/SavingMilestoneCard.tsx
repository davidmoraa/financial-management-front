import { Pencil, Target, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatTransactionDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { SavingMilestone } from "@/types/savingMilestones";

type SavingMilestoneCardProps = {
  milestone: SavingMilestone;
  onDelete: () => void;
  onEdit: () => void;
};

const healthCopy = {
  on_track: { label: "Vas en tiempo", className: "bg-lime-100 text-lime-700" },
  needs_attention: { label: "Necesita atención", className: "bg-amber-100 text-amber-800" },
  at_risk: { label: "En riesgo", className: "bg-red-100 text-red-700" },
  completed: { label: "Meta completada", className: "bg-teal-100 text-primary" },
};

const frequencyContributionKey = {
  daily: "requiredDailyContribution",
  weekly: "requiredWeeklyContribution",
  biweekly: "requiredBiweeklyContribution",
  monthly: "requiredMonthlyContribution",
} as const;

const frequencyLabel = {
  daily: "día",
  weekly: "semana",
  biweekly: "quincena",
  monthly: "mes",
};

export function SavingMilestoneCard({ milestone, onDelete, onEdit }: SavingMilestoneCardProps) {
  const health = healthCopy[milestone.projection.health];
  const requiredContribution = milestone.projection[frequencyContributionKey[milestone.contributionFrequency]];
  const progress = Math.min(100, milestone.projection.progressPercentage);

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-lime-100 text-lime-700 shadow-soft">
            <Target className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-lg font-black tracking-normal text-foreground">{milestone.name}</h3>
            <p className="truncate text-sm font-semibold text-muted-foreground">
              Meta para {formatTransactionDate(milestone.targetDate)}
            </p>
          </div>
        </div>
        <span className={cn("rounded-full px-3 py-1 text-xs font-black", health.className)}>{health.label}</span>
      </div>

      <div className="mt-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">Progreso</p>
            <p className="mt-1 text-2xl font-black tracking-normal text-foreground">{formatCurrency(milestone.currentAmount)}</p>
          </div>
          <p className="text-sm font-black text-muted-foreground">de {formatCurrency(milestone.targetAmount)}</p>
        </div>
        <Progress value={progress} className="mt-3" indicatorClassName={milestone.projection.health === "at_risk" ? "bg-red-500" : "bg-primary"} />
      </div>

      <div className="mt-5 rounded-2xl bg-teal-50/70 p-4 text-sm font-bold text-teal-900">
        {milestone.projection.health === "completed"
          ? "Meta completada. Puedes mantenerla como referencia o desactivarla."
          : `Para llegar a tiempo, aparta ${formatCurrency(requiredContribution)} por ${frequencyLabel[milestone.contributionFrequency]}.`}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Button variant="outline" onClick={onEdit}>
          <Pencil className="h-4 w-4" aria-hidden="true" />
          Editar
        </Button>
        <Button variant="outline" onClick={onDelete} disabled={!milestone.isActive}>
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Desactivar
        </Button>
      </div>
    </Card>
  );
}

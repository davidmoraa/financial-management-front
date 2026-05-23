import { Link } from "react-router-dom";
import { Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatTransactionDate } from "@/lib/formatters";
import type { SavingMilestone } from "@/types/savingMilestones";

type ActiveSavingMilestonesCardProps = {
  isLoading?: boolean;
  milestones: SavingMilestone[];
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

export function ActiveSavingMilestonesCard({ isLoading, milestones }: ActiveSavingMilestonesCardProps) {
  const visibleMilestones = milestones
    .filter((milestone) => milestone.isActive)
    .sort((a, b) => priorityWeight(a) - priorityWeight(b) || a.targetDate.localeCompare(b.targetDate))
    .slice(0, 3);

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-normal text-primary">Metas activas</p>
          <h2 className="mt-2 text-xl font-black tracking-normal text-foreground">Ahorro con intención</h2>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-100 text-lime-700">
          <Target className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      {isLoading && (
        <div className="mt-4 space-y-2">
          <div className="h-16 animate-pulse rounded-2xl bg-teal-50" />
          <div className="h-16 animate-pulse rounded-2xl bg-teal-50/70" />
        </div>
      )}

      {!isLoading && visibleMilestones.length === 0 && (
        <div className="mt-4 rounded-2xl bg-teal-50/70 p-4">
          <p className="text-sm font-semibold leading-6 text-muted-foreground">
            Sin metas activas por ahora. Puedes crear una para convertir un objetivo en una aportación clara.
          </p>
          <Link to="/saving-milestones" className="mt-3 inline-flex text-sm font-black text-primary hover:underline">
            Crear meta
          </Link>
        </div>
      )}

      {!isLoading && visibleMilestones.length > 0 && (
        <div className="mt-4 space-y-3">
          {visibleMilestones.map((milestone) => {
            const requiredContribution = milestone.projection[frequencyContributionKey[milestone.contributionFrequency]];

            return (
              <Link
                key={milestone.id}
                to="/saving-milestones"
                className="block rounded-2xl border border-teal-100 bg-white/75 p-4 transition hover:bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-black tracking-normal text-foreground">{milestone.name}</h3>
                    <p className="mt-1 text-xs font-bold text-muted-foreground">
                      {formatTransactionDate(milestone.targetDate)} · {formatCurrency(requiredContribution)} por {frequencyLabel[milestone.contributionFrequency]}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-black text-primary">
                    {Math.min(100, Math.round(milestone.projection.progressPercentage))}%
                  </p>
                </div>
                <Progress value={milestone.projection.progressPercentage} className="mt-3 h-2" />
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function priorityWeight(milestone: SavingMilestone) {
  if (milestone.priority === "essential") return 0;
  if (milestone.priority === "important") return 1;
  return 2;
}

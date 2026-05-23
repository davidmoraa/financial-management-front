import { Flame, Sparkles, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { DashboardSummary } from "@/types/dashboard";

type FinancialStreakCardProps = {
  summary: DashboardSummary;
};

export function FinancialStreakCard({ summary }: FinancialStreakCardProps) {
  const currentStreakDays = Number.isFinite(summary.habit.currentStreakDays) ? Math.max(0, summary.habit.currentStreakDays) : 0;
  const nextMilestoneDays = Math.max(1, summary.habit.nextMilestoneDays ?? getNextMilestone(currentStreakDays));
  const rawDaysToNextMilestone = summary.habit.daysToNextMilestone ?? Math.max(0, nextMilestoneDays - currentStreakDays);
  const daysToNextMilestone = Number.isFinite(rawDaysToNextMilestone) ? Math.max(0, rawDaysToNextMilestone) : 0;
  const rawMilestoneProgressPercentage = summary.habit.milestoneProgressPercentage ?? Math.round((currentStreakDays / nextMilestoneDays) * 100);
  const milestoneProgressPercentage = Number.isFinite(rawMilestoneProgressPercentage)
    ? Math.min(100, Math.max(0, rawMilestoneProgressPercentage))
    : 0;
  const registrationCoveragePercentage = Number.isFinite(summary.habit.registrationCoveragePercentage)
    ? Math.min(100, Math.max(0, summary.habit.registrationCoveragePercentage))
    : 0;
  const streakHeadline = currentStreakDays === 0 ? "Empieza hoy" : `${currentStreakDays} días`;
  const streakCopy = currentStreakDays === 0
    ? "Registra un movimiento para iniciar tu racha."
    : "Vas construyendo claridad.";

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase tracking-normal text-primary">Hábito</p>
          <h2 className="mt-1 text-lg font-black tracking-normal text-foreground">Racha financiera</h2>
        </div>
        <div className="flex items-center gap-2">
          {summary.habit.isAtRisk && (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-800">En juego</span>
          )}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lime-100 text-lime-700">
            <Flame className="h-5 w-5" aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <div className="rounded-[1.25rem] bg-teal-50/70 p-4">
          <p className="text-sm font-bold text-teal-800">Racha actual</p>
          <p className="mt-1 text-3xl font-black text-foreground">{streakHeadline}</p>
          <p className="mt-2 text-sm font-bold leading-5 text-teal-800">{streakCopy}</p>
        </div>
        <div className="rounded-[1.25rem] bg-white/70 p-4 ring-1 ring-border">
          <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
            <Target className="h-4 w-4 text-primary" aria-hidden="true" />
            Cobertura de registro
          </div>
          <p className="mt-2 text-2xl font-black text-foreground">{registrationCoveragePercentage}%</p>
          <Progress value={registrationCoveragePercentage} className="mt-3" />
        </div>
      </div>

      <div className="mt-3 rounded-[1.25rem] border border-lime-100 bg-lime-50/70 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-black text-lime-900">
              <Sparkles className="h-4 w-4 shrink-0 text-lime-700" aria-hidden="true" />
              Meta de {nextMilestoneDays} días
            </div>
            <p className="mt-1 text-xs font-bold leading-5 text-lime-800">
              {daysToNextMilestone === 0 ? "Meta alcanzada. La siguiente empieza ahora." : `Faltan ${daysToNextMilestone} día${daysToNextMilestone === 1 ? "" : "s"}.`}
            </p>
          </div>
          <span className="shrink-0 text-lg font-black text-lime-900">{milestoneProgressPercentage}%</span>
        </div>
        <Progress value={milestoneProgressPercentage} className="mt-3" indicatorClassName="bg-lime-500" />
      </div>

      <p className="mt-4 rounded-2xl bg-lime-50 px-3 py-3 text-sm font-bold leading-6 text-lime-900">
        {streakCopy}
      </p>
    </Card>
  );
}

function getNextMilestone(currentStreakDays: number) {
  return [3, 7, 14, 30, 60, 100].find((milestone) => milestone > currentStreakDays) ?? currentStreakDays + 30;
}

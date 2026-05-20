import { Flame, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { DashboardSummary } from "@/types/dashboard";

type FinancialStreakCardProps = {
  summary: DashboardSummary;
};

export function FinancialStreakCard({ summary }: FinancialStreakCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase tracking-normal text-primary">Hábito</p>
          <h2 className="mt-1 text-lg font-black tracking-normal text-foreground">Racha financiera</h2>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lime-100 text-lime-700">
          <Flame className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <div className="rounded-[1.25rem] bg-teal-50/70 p-4">
          <p className="text-sm font-bold text-teal-800">Racha actual</p>
          <p className="mt-1 text-3xl font-black text-foreground">{summary.habit.currentStreakDays} días</p>
        </div>
        <div className="rounded-[1.25rem] bg-white/70 p-4 ring-1 ring-border">
          <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
            <Target className="h-4 w-4 text-primary" aria-hidden="true" />
            Cobertura de registro
          </div>
          <p className="mt-2 text-2xl font-black text-foreground">{summary.habit.registrationCoveragePercentage}%</p>
          <Progress value={summary.habit.registrationCoveragePercentage} className="mt-3" />
        </div>
      </div>

      <p className="mt-4 rounded-2xl bg-lime-50 px-3 py-3 text-sm font-bold leading-6 text-lime-900">
        {summary.habit.message}
      </p>
    </Card>
  );
}

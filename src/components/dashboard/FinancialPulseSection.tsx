import { Activity, Flame, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { DashboardSummary } from "@/types/dashboard";

type FinancialPulseSectionProps = {
  summary: DashboardSummary;
};

export function FinancialPulseSection({ summary }: FinancialPulseSectionProps) {
  const usedPercentage = clampPercentage(summary.budget.usedPercentage);
  const registrationCoverage = clampPercentage(summary.habit.registrationCoveragePercentage);
  const streakDays = Number.isFinite(summary.habit.currentStreakDays)
    ? Math.max(0, summary.habit.currentStreakDays)
    : 0;
  const nextMilestone = Math.max(1, summary.habit.nextMilestoneDays ?? getNextMilestone(streakDays));
  const milestoneProgress = clampPercentage(
    summary.habit.milestoneProgressPercentage ?? Math.round((streakDays / nextMilestone) * 100),
  );

  return (
    <section className="space-y-3" aria-label="Pulso financiero">
      <div className="flex min-w-0 items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-black uppercase tracking-normal text-primary">Pulso financiero</p>
          <h2 className="mt-1 text-xl font-black tracking-normal text-foreground">Progreso que puedes cuidar hoy</h2>
        </div>
      </div>

      <div className="grid min-w-0 gap-3 md:grid-cols-3">
        <PulseMetricCard
          icon={Activity}
          label="Ritmo del periodo"
          value={summary.budget.monthlyBudget > 0 ? `${usedPercentage}% usado` : "Sin presupuesto"}
          description={getBudgetPulseCopy(summary, usedPercentage)}
          progress={summary.budget.monthlyBudget > 0 ? usedPercentage : undefined}
          tone={summary.balance.status === "risk" ? "risk" : summary.balance.status === "warning" ? "warning" : "healthy"}
        />
        <PulseMetricCard
          icon={ShieldCheck}
          label="Claridad financiera"
          value={`${registrationCoverage}%`}
          description="Tus registros sostienen una proyección confiable."
          progress={registrationCoverage}
          tone={registrationCoverage >= 70 ? "healthy" : registrationCoverage >= 35 ? "warning" : "neutral"}
        />
        <PulseMetricCard
          icon={Flame}
          label="Racha financiera"
          value={`${streakDays} día${streakDays === 1 ? "" : "s"}`}
          description={summary.habit.daysToNextMilestone === 0 ? "Meta alcanzada. Sigue con el siguiente registro." : summary.habit.message}
          progress={milestoneProgress}
          tone={summary.habit.isAtRisk ? "warning" : "healthy"}
        />
      </div>
    </section>
  );
}

function PulseMetricCard({
  description,
  icon: Icon,
  label,
  progress,
  tone,
  value,
}: {
  description: string;
  icon: LucideIcon;
  label: string;
  progress?: number;
  tone: "healthy" | "warning" | "risk" | "neutral";
  value: string;
}) {
  return (
    <Card className={cn("overflow-hidden rounded-[1.45rem] p-4", pulseSurfaceClass(tone))}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-normal text-muted-foreground">{label}</p>
          <p className="mt-2 truncate text-2xl font-black tracking-normal text-foreground">{value}</p>
        </div>
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl", pulseIconClass(tone))}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-3 min-h-[2.5rem] text-sm font-semibold leading-5 text-muted-foreground">{description}</p>
      {typeof progress === "number" && (
        <Progress value={progress} className="mt-4 h-2 bg-white/70" indicatorClassName={pulseProgressClass(tone)} />
      )}
    </Card>
  );
}

function clampPercentage(value: number) {
  return Number.isFinite(value) ? Math.min(100, Math.max(0, Math.round(value))) : 0;
}

function getBudgetPulseCopy(summary: DashboardSummary, usedPercentage: number) {
  if (summary.budget.monthlyBudget <= 0) {
    return "Configura tu presupuesto para medir mejor tu ritmo.";
  }

  if (usedPercentage >= 100) {
    return "Ya pasaste tu presupuesto. Ajusta el ritmo con calma.";
  }

  if (usedPercentage >= 80) {
    return "Cuida tu ritmo esta semana para cerrar estable.";
  }

  return "Vas dentro del plan. Mantén registros consistentes.";
}

function getNextMilestone(currentStreakDays: number) {
  return [3, 7, 14, 30, 60, 100].find((milestone) => milestone > currentStreakDays) ?? currentStreakDays + 30;
}

function pulseSurfaceClass(tone: "healthy" | "warning" | "risk" | "neutral") {
  if (tone === "risk") return "border-red-100 bg-red-50/75";
  if (tone === "warning") return "border-amber-100 bg-amber-50/75";
  if (tone === "healthy") return "border-teal-100 bg-teal-50/70";
  return "border-slate-100 bg-white/82";
}

function pulseIconClass(tone: "healthy" | "warning" | "risk" | "neutral") {
  if (tone === "risk") return "bg-red-100 text-red-700";
  if (tone === "warning") return "bg-amber-100 text-amber-700";
  if (tone === "healthy") return "bg-lime-100 text-lime-700";
  return "bg-slate-100 text-slate-700";
}

function pulseProgressClass(tone: "healthy" | "warning" | "risk" | "neutral") {
  if (tone === "risk") return "bg-red-500";
  if (tone === "warning") return "bg-amber-400";
  if (tone === "healthy") return "bg-primary";
  return "bg-slate-400";
}

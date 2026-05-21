import { motion } from "motion/react";
import { ArrowDownRight, ArrowUpRight, Gauge, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { DashboardSummary } from "@/types/dashboard";

type FinancialStatusHeroProps = {
  summary: DashboardSummary;
};

const statusCopy = {
  healthy: "Mes saludable",
  warning: "Ritmo a vigilar",
  risk: "Riesgo de presupuesto",
};

export function FinancialStatusHero({ summary }: FinancialStatusHeroProps) {
  const isPositiveProjection = summary.balance.projectedEndOfMonth >= 0;
  const ProjectionIcon = isPositiveProjection ? ArrowUpRight : ArrowDownRight;
  const periodLabel = summary.period?.shortLabel.toLowerCase() ?? "mes";
  const statusTitle = {
    healthy: `Tu ${periodLabel} va bajo control.`,
    warning: `Tu ${periodLabel} necesita atención.`,
    risk: `Conviene ajustar tu ${periodLabel}.`,
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cn(
        "overflow-hidden rounded-[1.8rem] p-5 text-primary-foreground shadow-lift md:p-7",
        summary.balance.status === "risk"
          ? "bg-gradient-to-br from-red-700 via-red-600 to-amber-500"
          : summary.balance.status === "warning"
            ? "bg-gradient-to-br from-teal-800 via-teal-700 to-amber-500"
            : "bg-gradient-to-br from-teal-800 via-primary to-teal-600",
      )}
    >
      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.06fr)_minmax(18rem,0.74fr)] lg:items-end">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/14 px-3 py-1.5 text-sm font-bold text-teal-50">
            <ShieldCheck className="h-4 w-4 text-lime-200" aria-hidden="true" />
            {statusCopy[summary.balance.status]}
          </div>
          <h2 className="mt-5 max-w-2xl text-3xl font-black tracking-normal md:text-5xl">{statusTitle[summary.balance.status]}</h2>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-teal-50/82 md:text-base">
            {summary.balance.message}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <HeroMetric
              label="Balance proyectado"
              value={formatCurrency(summary.balance.projectedEndOfMonth)}
              icon={ProjectionIcon}
            />
            <HeroMetric
              label="Disponible seguro hoy"
              value={formatCurrency(summary.spendingPower.safeToSpendToday)}
              icon={Gauge}
            />
          </div>
        </div>

        <div className="min-w-0 rounded-[1.4rem] bg-white/12 p-4 ring-1 ring-white/16 backdrop-blur">
          <p className="text-sm font-bold text-teal-50/85">Lectura rápida</p>
          <div className="mt-4 grid gap-2">
            <HeroInsight label="Balance actual" value={formatCurrency(summary.balance.current)} />
            <HeroInsight label="Ingreso pendiente" value={formatCurrency(summary.income.pending)} />
            <HeroInsight label="Fijos pendientes" value={formatCurrency(summary.expenses.fixedPending)} />
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function HeroInsight({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-2xl bg-white/12 px-3 py-3 ring-1 ring-white/10">
      <span className="min-w-0 truncate text-sm font-bold text-teal-50/78">{label}</span>
      <span className="shrink-0 text-sm font-black text-white">{value}</span>
    </div>
  );
}

function HeroMetric({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  return (
    <div className="min-w-0 rounded-[1.25rem] bg-white/12 p-4 ring-1 ring-white/14">
      <div className="flex items-center gap-2 text-sm font-bold text-teal-50/80">
        <Icon className="h-4 w-4 shrink-0 text-lime-200" aria-hidden="true" />
        <span className="min-w-0 truncate">{label}</span>
      </div>
      <p className="mt-2 truncate text-2xl font-black tracking-normal text-white">{value}</p>
    </div>
  );
}

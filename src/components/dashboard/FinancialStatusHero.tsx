import { motion, useReducedMotion } from "motion/react";
import { ArrowDownRight, ArrowUpRight, Gauge, Plus, ShieldCheck, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { DashboardSummary } from "@/types/dashboard";

type FinancialStatusHeroProps = {
  summary: DashboardSummary;
};

const statusCopy = {
  healthy: "Mes saludable",
  warning: "Atención",
  risk: "Riesgo",
};

export function FinancialStatusHero({ summary }: FinancialStatusHeroProps) {
  const shouldReduceMotion = useReducedMotion();
  const isPositiveProjection = summary.balance.projectedEndOfMonth >= 0;
  const ProjectionIcon = isPositiveProjection ? ArrowUpRight : ArrowDownRight;
  const copy = getHeroCopy(summary);

  return (
    <motion.section
      initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "relative overflow-hidden rounded-[2rem] p-5 text-primary-foreground shadow-[0_28px_80px_-34px_rgba(6,78,59,0.9)] md:p-7",
        summary.balance.status === "risk"
          ? "bg-[radial-gradient(circle_at_16%_0%,rgba(253,186,116,0.34),transparent_32%),linear-gradient(135deg,#4a1d1f_0%,#9f2f2f_52%,#0f766e_100%)]"
          : summary.balance.status === "warning"
            ? "bg-[radial-gradient(circle_at_85%_6%,rgba(254,240,138,0.42),transparent_30%),linear-gradient(135deg,#083f3b_0%,#0f766e_58%,#ca8a04_100%)]"
            : "bg-[radial-gradient(circle_at_82%_2%,rgba(190,242,100,0.46),transparent_30%),radial-gradient(circle_at_8%_100%,rgba(45,212,191,0.32),transparent_36%),linear-gradient(135deg,#073b37_0%,#0f766e_52%,#14b8a6_100%)]",
      )}
    >
      <div className="relative grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,0.58fr)] lg:items-end">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-black text-teal-50 ring-1 ring-white/15 backdrop-blur">
            <ShieldCheck className="h-4 w-4 text-lime-200" aria-hidden="true" />
            {statusCopy[summary.balance.status]}
          </div>
          <p className="mt-6 text-sm font-black uppercase tracking-normal text-lime-100/95">Hoy puedes gastar</p>
          <h2 className="mt-1 max-w-full break-words text-[3.25rem] font-black leading-none tracking-normal text-white sm:text-6xl md:text-7xl">
            {formatCurrency(summary.spendingPower.safeToSpendToday)}
          </h2>
          <p className="mt-3 max-w-2xl text-2xl font-black leading-tight tracking-normal text-white md:text-4xl">
            {copy.title}
          </p>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-teal-50/86 md:text-base">
            {copy.description}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <HeroMetric
              label="Cierre proyectado"
              value={formatCurrency(summary.balance.projectedEndOfMonth)}
              icon={ProjectionIcon}
            />
            <HeroMetric
              label="Disponible seguro hoy"
              value={formatCurrency(summary.spendingPower.safeToSpendToday)}
              icon={Gauge}
            />
          </div>

          <Button asChild size="lg" className="mt-6 w-full bg-white text-primary shadow-[0_18px_42px_-18px_rgba(255,255,255,0.75)] hover:bg-lime-50 sm:w-auto">
            <Link to="/new">
              <Plus className="h-5 w-5" aria-hidden="true" />
              Registrar movimiento
            </Link>
          </Button>
        </div>

        <div className="min-w-0 rounded-[1.6rem] bg-white/13 p-4 ring-1 ring-white/18 backdrop-blur-md">
          <div className="flex items-center gap-2 text-sm font-black text-teal-50/90">
            <Sparkles className="h-4 w-4 text-lime-200" aria-hidden="true" />
            Lectura rápida
          </div>
          <p className="mt-2 text-sm font-semibold leading-6 text-teal-50/78">{summary.balance.message}</p>
          <div className="mt-4 grid gap-2">
            <HeroInsight label="Balance actual" value={formatCurrency(summary.balance.current)} />
            <HeroInsight label="Ingreso pendiente" value={formatCurrency(summary.income.pending)} />
            <HeroInsight label="Protegido para pagos" value={formatCurrency(summary.spendingPower.protectedForObligations ?? summary.expenses.fixedPending)} />
            <HeroInsight label="Tarjetas" value={formatCurrency(summary.spendingPower.protectedForCreditCards ?? 0)} />
            <HeroInsight label="Metas" value={formatCurrency(summary.spendingPower.protectedForSavings ?? 0)} />
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function getHeroCopy(summary: DashboardSummary) {
  const hasProtectedObligations = (summary.spendingPower.protectedForObligations ?? 0) > 0;

  if (summary.balance.status === "risk") {
    return {
      title: "tu mes necesita atención.",
      description: "Registra y revisa tus gastos para recuperar control sin perder claridad.",
    };
  }

  if (summary.balance.status === "warning") {
    return {
      title: hasProtectedObligations ? "sin afectar pagos ni metas." : "para mantener el mes estable.",
      description: hasProtectedObligations
        ? `Ya apartamos ${formatCurrency(summary.spendingPower.protectedForObligations ?? 0)} para compromisos del periodo.`
        : `Cuida tu ritmo hoy. Si mantienes este plan, cerrarás con ${formatCurrency(summary.balance.projectedEndOfMonth)}.`,
    };
  }

  return {
    title: hasProtectedObligations ? "sin afectar pagos ni metas." : "con calma, sin salirte del plan.",
    description: hasProtectedObligations
      ? `Tu proyección protege ${formatCurrency(summary.spendingPower.protectedForObligations ?? 0)} y aún estima cerrar con ${formatCurrency(summary.balance.projectedEndOfMonth)}.`
      : `Si mantienes este ritmo, cerrarás el mes con ${formatCurrency(summary.balance.projectedEndOfMonth)} disponibles.`,
  };
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

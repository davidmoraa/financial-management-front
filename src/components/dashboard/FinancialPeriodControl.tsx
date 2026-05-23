import { Link } from "react-router-dom";
import { CalendarRange, CheckCircle2, Clock3 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { dashboardPeriodOptions } from "@/lib/dashboard/dashboardPeriod";
import { cn } from "@/lib/utils";
import type { DashboardPeriod, DashboardPeriodType, DashboardSummary } from "@/types/dashboard";

type FinancialPeriodControlProps = {
  currentDate: Date;
  onChange: (value: DashboardPeriodType) => void;
  period: DashboardPeriod;
  summary?: DashboardSummary;
  value: DashboardPeriodType;
};

const viewLabels: Record<DashboardPeriodType, string> = {
  monthly: "Vista mensual",
  biweekly: "Vista quincenal",
  weekly: "Vista semanal",
};

export function FinancialPeriodControl({
  currentDate,
  onChange,
  period,
  summary,
  value,
}: FinancialPeriodControlProps) {
  const periodTitle = format(currentDate, "MMMM yyyy", { locale: es });
  const periodRangeLabel = formatDashboardDateRange(period);
  const hasMovementToday = hasRegisteredToday(summary, currentDate);

  return (
    <section className="rounded-[1.55rem] border border-teal-100/80 bg-white/72 p-3 shadow-[0_18px_56px_-44px_rgba(15,82,78,0.8)] backdrop-blur md:p-4">
      <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-primary">
            <CalendarRange className="h-5 w-5" aria-hidden="true" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-normal text-primary">Analizando</p>
            <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <h2 className="truncate text-xl font-black tracking-normal text-foreground">{periodTitle}</h2>
              <span className="rounded-full bg-lime-50 px-2.5 py-1 text-xs font-black text-lime-800 ring-1 ring-lime-100">
                Activo
              </span>
            </div>
            <p className="mt-1 text-sm font-bold leading-5 text-muted-foreground">
              {viewLabels[value]} · {periodRangeLabel}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1 rounded-2xl bg-teal-50/85 p-1" role="group" aria-label="Vista del periodo financiero">
          {dashboardPeriodOptions.map((option) => (
            <button
              key={option.type}
              type="button"
              aria-pressed={value === option.type}
              onClick={() => onChange(option.type)}
              className={cn(
                "h-10 min-w-0 rounded-xl px-2 text-sm font-black outline-none transition focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                value === option.type
                  ? "bg-white text-primary shadow-soft ring-1 ring-white/90"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <PeriodStatus hasMovementToday={hasMovementToday} />
      </div>
    </section>
  );
}

function PeriodStatus({ hasMovementToday }: { hasMovementToday: boolean }) {
  if (hasMovementToday) {
    return (
      <div className="inline-flex min-w-0 items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-800 ring-1 ring-emerald-100">
        <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="truncate">Actualizado con tus registros de hoy</span>
      </div>
    );
  }

  return (
    <Link
      to="/new"
      className="inline-flex min-w-0 items-center gap-2 rounded-full bg-lime-50 px-3 py-2 text-xs font-black text-lime-800 ring-1 ring-lime-100 outline-none transition hover:bg-lime-100 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <Clock3 className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="truncate">Registra hoy para mejorar tu proyección</span>
    </Link>
  );
}

function hasRegisteredToday(summary: DashboardSummary | undefined, currentDate: Date) {
  if (!summary?.recentMovements?.length) {
    return false;
  }

  const todayKey = format(currentDate, "yyyy-MM-dd");
  return summary.recentMovements.some((movement) => movement.date === todayKey);
}

export function formatDashboardDateRange(period: DashboardPeriod) {
  const startsAt = parseISO(period.startsAt);
  const endsAt = parseISO(period.endsAt);
  const startsMonth = format(startsAt, "MMMM", { locale: es });
  const endsMonth = format(endsAt, "MMMM", { locale: es });

  if (startsMonth === endsMonth) {
    return `${format(startsAt, "d", { locale: es })} ${startsMonth} - ${format(endsAt, "d", { locale: es })} ${endsMonth}`;
  }

  return `${format(startsAt, "d MMM", { locale: es })} - ${format(endsAt, "d MMM", { locale: es })}`;
}

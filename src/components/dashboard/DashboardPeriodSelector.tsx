import { CalendarRange } from "lucide-react";
import { dashboardPeriodOptions } from "@/lib/dashboard/dashboardPeriod";
import { cn } from "@/lib/utils";
import type { DashboardPeriod, DashboardPeriodType } from "@/types/dashboard";

type DashboardPeriodSelectorProps = {
  value: DashboardPeriodType;
  period: DashboardPeriod;
  onChange: (value: DashboardPeriodType) => void;
};

export function DashboardPeriodSelector({ value, period, onChange }: DashboardPeriodSelectorProps) {
  return (
    <section className="rounded-[1.35rem] border border-teal-100 bg-white/64 p-3 shadow-soft">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-primary">
            <CalendarRange className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-normal text-primary">Vista del dashboard</p>
            <p className="mt-1 truncate text-sm font-bold text-muted-foreground">
              {period.label} · {period.startsAt} a {period.endsAt}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1 rounded-2xl bg-teal-50 p-1">
          {dashboardPeriodOptions.map((option) => (
            <button
              key={option.type}
              type="button"
              onClick={() => onChange(option.type)}
              className={cn(
                "h-10 rounded-xl px-3 text-sm font-black transition",
                value === option.type ? "bg-white text-primary shadow-soft" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

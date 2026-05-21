import { formatShortDate } from "@/lib/formatters";
import { FinancialClarityBadge } from "@/components/dashboard/FinancialClarityBadge";
import type { DashboardSummary } from "@/types/dashboard";

type DashboardHeaderProps = {
  currentDate: Date;
  summary?: DashboardSummary;
};

export function DashboardHeader({ currentDate, summary }: DashboardHeaderProps) {
  return (
    <section className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-[1.35rem] border border-teal-100 bg-white/58 px-4 py-3 shadow-soft">
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-normal text-primary">Periodo activo</p>
        <h2 className="mt-1 text-lg font-black tracking-normal text-foreground">{formatShortDate(currentDate)}</h2>
      </div>
      <FinancialClarityBadge currentDate={currentDate} summary={summary} />
    </section>
  );
}

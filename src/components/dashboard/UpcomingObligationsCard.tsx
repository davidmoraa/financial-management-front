import { CalendarClock, CreditCard, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatTransactionDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { DashboardSummary } from "@/types/dashboard";

type UpcomingObligationsCardProps = {
  summary: DashboardSummary;
};

type Obligation = DashboardSummary["upcomingObligations"][number];

const sourceCopy: Record<Obligation["source"], { icon: LucideIcon; label: string }> = {
  fixed_expense: {
    icon: CalendarClock,
    label: "Gasto fijo",
  },
  credit_card_statement: {
    icon: CreditCard,
    label: "Tarjeta",
  },
  saving_milestone: {
    icon: Target,
    label: "Meta",
  },
};

const statusCopy: Record<Obligation["status"], { label: string; className: string }> = {
  pending: {
    label: "Pendiente",
    className: "bg-teal-50 text-primary ring-teal-100",
  },
  due_soon: {
    label: "Próximo",
    className: "bg-amber-50 text-amber-800 ring-amber-100",
  },
  overdue: {
    label: "Vencido",
    className: "bg-red-50 text-red-700 ring-red-100",
  },
  reserved: {
    label: "Reservado",
    className: "bg-lime-50 text-lime-800 ring-lime-100",
  },
  paid: {
    label: "Pagado",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
};

export function UpcomingObligationsCard({ summary }: UpcomingObligationsCardProps) {
  const obligations = (summary.upcomingObligations ?? []).slice(0, 5);

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-black uppercase tracking-normal text-primary">Compromisos próximos</p>
          <h2 className="mt-2 text-xl font-black tracking-normal text-foreground">Pagos y metas protegidas</h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-muted-foreground">
            Lo que Money Flux aparta antes de calcular tu gasto libre.
          </p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lime-100 text-lime-700">
          <CalendarClock className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      {obligations.length === 0 ? (
        <p className="mt-4 rounded-2xl bg-teal-50/70 p-4 text-sm font-semibold leading-6 text-muted-foreground">
          No hay compromisos adicionales dentro del periodo activo.
        </p>
      ) : (
        <div className="mt-4 space-y-2">
          {obligations.map((obligation) => {
            const SourceIcon = sourceCopy[obligation.source].icon;
            const status = statusCopy[obligation.status];

            return (
              <article key={obligation.id} className="rounded-2xl border border-teal-100 bg-white/78 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-primary">
                      <SourceIcon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-black tracking-normal text-foreground">{obligation.name}</h3>
                      <p className="mt-1 text-xs font-bold text-muted-foreground">
                        {sourceCopy[obligation.source].label} · {formatTransactionDate(obligation.dueDate)}
                      </p>
                    </div>
                  </div>
                  <p className="shrink-0 text-lg font-black tracking-normal text-foreground">{formatCurrency(obligation.amount)}</p>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-black ring-1", status.className)}>
                    {status.label}
                  </span>
                  <span className="text-xs font-bold text-muted-foreground">
                    Prioridad {priorityLabel(obligation.priority)}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function priorityLabel(priority: Obligation["priority"]) {
  if (priority === "essential") {
    return "esencial";
  }

  if (priority === "important") {
    return "importante";
  }

  return "opcional";
}

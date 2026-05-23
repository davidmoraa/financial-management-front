import { AlertTriangle, CalendarClock, CreditCard } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatTransactionDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { CreditCardPaymentObligation } from "@/types/creditCards";

type UpcomingCreditCardPaymentsCardProps = {
  isLoading?: boolean;
  obligations: CreditCardPaymentObligation[];
};

const statusCopy: Record<CreditCardPaymentObligation["status"], { label: string; className: string }> = {
  upcoming: {
    label: "Próximo",
    className: "bg-teal-50 text-primary",
  },
  due_soon: {
    label: "Vence pronto",
    className: "bg-amber-100 text-amber-800",
  },
  overdue: {
    label: "Vencido",
    className: "bg-red-100 text-red-700",
  },
  paid: {
    label: "Pagado",
    className: "bg-lime-100 text-lime-700",
  },
};

export function UpcomingCreditCardPaymentsCard({ isLoading, obligations }: UpcomingCreditCardPaymentsCardProps) {
  const visibleObligations = obligations.slice(0, 3);

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-normal text-primary">Pagos de tarjeta próximos</p>
          <h2 className="mt-2 text-xl font-black tracking-normal text-foreground">Ciclos a pagar</h2>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-100 text-primary">
          <CreditCard className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      {isLoading && (
        <div className="mt-4 space-y-2">
          <div className="h-16 animate-pulse rounded-2xl bg-teal-50" />
          <div className="h-16 animate-pulse rounded-2xl bg-teal-50/70" />
        </div>
      )}

      {!isLoading && visibleObligations.length === 0 && (
        <p className="mt-4 rounded-2xl bg-teal-50/70 p-4 text-sm font-semibold leading-6 text-muted-foreground">
          No hay pagos de tarjeta próximos en el rango revisado.
        </p>
      )}

      {!isLoading && visibleObligations.length > 0 && (
        <div className="mt-4 space-y-2">
          {visibleObligations.map((obligation) => {
            const status = statusCopy[obligation.status];
            const StatusIcon = obligation.status === "overdue" || obligation.status === "due_soon" ? AlertTriangle : CalendarClock;

            return (
              <article key={obligation.id} className="rounded-2xl border border-teal-100 bg-white/75 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-black tracking-normal text-foreground">{obligation.creditCardName}</h3>
                    <p className="mt-1 text-xs font-bold text-muted-foreground">
                      Corte {formatTransactionDate(obligation.statementEndDate)} · {obligation.movementsCount} mov.
                    </p>
                  </div>
                  <p className="shrink-0 text-lg font-black tracking-normal text-foreground">{formatCurrency(obligation.amount)}</p>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black", status.className)}>
                    <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    {status.label}
                  </span>
                  <span className="text-xs font-bold text-muted-foreground">
                    Pagar antes del {formatTransactionDate(obligation.paymentDueDate)}
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

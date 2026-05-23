import { CalendarClock, CreditCard, PiggyBank, ShieldCheck, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatTransactionDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { DashboardSummary } from "@/types/dashboard";

type SafeToSpendExplanationProps = {
  summary: DashboardSummary;
};

type ExplanationItem = {
  id: string;
  label: string;
  amount: number;
  detail: string;
  icon: LucideIcon;
  tone: "fixed" | "card" | "saving" | "buffer";
};

const toneClass: Record<ExplanationItem["tone"], string> = {
  fixed: "bg-teal-50 text-primary",
  card: "bg-indigo-50 text-indigo-700",
  saving: "bg-lime-50 text-lime-800",
  buffer: "bg-amber-50 text-amber-800",
};

export function SafeToSpendExplanation({ summary }: SafeToSpendExplanationProps) {
  const items = buildExplanationItems(summary);

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-black uppercase tracking-normal text-primary">Disponible seguro</p>
          <h2 className="mt-2 text-xl font-black tracking-normal text-foreground">Tu dinero libre ya considera pagos y metas.</h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-muted-foreground">
            Este número protege tu futuro cercano antes de sugerirte cuánto gastar hoy.
          </p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lime-100 text-lime-700">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 rounded-2xl bg-teal-50/70 p-4 text-sm font-semibold leading-6 text-muted-foreground">
          No hay pagos o metas reduciendo tu disponible de hoy.
        </p>
      ) : (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-black text-foreground">Tu disponible de hoy se calculó protegiendo:</p>
          {items.map((item) => (
            <div key={item.id} className="flex min-w-0 items-center justify-between gap-3 rounded-2xl bg-white/78 px-3 py-3 ring-1 ring-teal-100">
              <div className="flex min-w-0 items-center gap-3">
                <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl", toneClass[item.tone])}>
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-foreground">{item.label}</p>
                  <p className="truncate text-xs font-bold text-muted-foreground">{item.detail}</p>
                </div>
              </div>
              <p className="shrink-0 text-sm font-black text-foreground">{formatCurrency(item.amount)}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function buildExplanationItems(summary: DashboardSummary): ExplanationItem[] {
  const obligations = summary.upcomingObligations ?? [];
  const items = obligations.map((obligation) => ({
    id: obligation.id,
    label: obligation.name,
    amount: obligation.amount,
    detail: `${sourceLabel(obligation.source)} · ${formatTransactionDate(obligation.dueDate)}`,
    icon: sourceIcon(obligation.source),
    tone: sourceTone(obligation.source),
  }));
  const protectedTotal = summary.spendingPower.protectedForObligations ?? 0;
  const listedTotal = obligations.reduce((total, obligation) => total + obligation.amount, 0);
  const buffer = Math.max(0, protectedTotal - listedTotal);

  if (buffer > 0) {
    items.push({
      id: "minimum-cash-buffer",
      label: "Colchón recomendado",
      amount: buffer,
      detail: "Margen de seguridad del periodo",
      icon: PiggyBank,
      tone: "buffer",
    });
  }

  return items.filter((item) => item.amount > 0).slice(0, 6);
}

function sourceLabel(source: DashboardSummary["upcomingObligations"][number]["source"]) {
  if (source === "credit_card_statement") {
    return "Tarjeta";
  }

  if (source === "saving_milestone") {
    return "Meta";
  }

  return "Gasto fijo";
}

function sourceIcon(source: DashboardSummary["upcomingObligations"][number]["source"]) {
  if (source === "credit_card_statement") {
    return CreditCard;
  }

  if (source === "saving_milestone") {
    return Target;
  }

  return CalendarClock;
}

function sourceTone(source: DashboardSummary["upcomingObligations"][number]["source"]): ExplanationItem["tone"] {
  if (source === "credit_card_statement") {
    return "card";
  }

  if (source === "saving_milestone") {
    return "saving";
  }

  return "fixed";
}

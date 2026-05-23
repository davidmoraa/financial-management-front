import { CheckCircle2, Edit3, SkipForward, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency, paymentMethodLabels } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { FixedExpense, FixedExpenseOccurrence } from "@/types/fixedExpenses";

type FixedExpenseCardProps = {
  fixedExpense: FixedExpense;
  occurrence?: FixedExpenseOccurrence;
  status?: "pending" | "paid" | "skipped";
  onMarkPaid: (fixedExpense: FixedExpense) => void;
  onSkip: (fixedExpense: FixedExpense) => void;
  onEdit: (fixedExpense: FixedExpense) => void;
  onDelete: (fixedExpense: FixedExpense) => void;
};

export function FixedExpenseCard({ fixedExpense, occurrence, status: statusOverride, onMarkPaid, onSkip, onEdit, onDelete }: FixedExpenseCardProps) {
  const status = statusOverride ?? occurrence?.status ?? "pending";

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-foreground">{fixedExpense.name}</h3>
            <StatusBadge status={status} />
            {fixedExpense.syncStatus !== "synced" && <Badge tone="warning">{syncLabel(fixedExpense.syncStatus)}</Badge>}
          </div>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">{fixedExpense.categoryName}</p>
          <p className="mt-2 text-xs font-semibold text-teal-700">
            Pago del día {fixedExpense.paymentWindowStartDay} al {fixedExpense.paymentWindowEndDay}
            {fixedExpense.paymentMethod ? ` · ${paymentMethodLabels[fixedExpense.paymentMethod]}` : ""}
          </p>
        </div>
        <p className="shrink-0 text-lg font-bold text-foreground">{formatCurrency(fixedExpense.amount)}</p>
      </div>

      {fixedExpense.note && <p className="mt-3 rounded-2xl bg-slate-50 px-3 py-2 text-sm text-muted-foreground">{fixedExpense.note}</p>}

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Button size="sm" onClick={() => onMarkPaid(fixedExpense)} disabled={status === "paid"}>
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          {status === "paid" ? "Pagado" : "Marcar pagado"}
        </Button>
        <Button size="sm" variant="secondary" onClick={() => onSkip(fixedExpense)} disabled={status === "skipped"}>
          <SkipForward className="h-4 w-4" aria-hidden="true" />
          Omitir
        </Button>
        <Button size="sm" variant="outline" onClick={() => onEdit(fixedExpense)}>
          <Edit3 className="h-4 w-4" aria-hidden="true" />
          Editar
        </Button>
        <Button size="sm" variant="outline" onClick={() => onDelete(fixedExpense)}>
          <Trash2 className="h-4 w-4" aria-hidden="true" />
          Eliminar
        </Button>
      </div>
    </Card>
  );
}

function StatusBadge({ status }: { status: "pending" | "paid" | "skipped" }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-bold",
        status === "paid" && "bg-emerald-100 text-emerald-800",
        status === "skipped" && "bg-slate-100 text-slate-700",
        status === "pending" && "bg-amber-100 text-amber-800",
      )}
    >
      {status === "paid" ? "Pagado" : status === "skipped" ? "Omitido" : "Pendiente"}
    </span>
  );
}

function syncLabel(status: FixedExpense["syncStatus"]) {
  if (status === "pending") return "Por subir";
  if (status === "syncing") return "Subiendo...";
  if (status === "failed") return "No se pudo subir";
  if (status === "conflict") return "Revisar conflicto";
  return "Respaldado";
}

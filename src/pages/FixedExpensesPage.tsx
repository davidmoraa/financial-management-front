import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CalendarClock, Plus } from "lucide-react";
import { AppConfirmDialog } from "@/components/feedback/AppConfirmDialog";
import { FixedExpenseCard } from "@/components/fixed-expenses/FixedExpenseCard";
import { FixedExpenseForm } from "@/components/fixed-expenses/FixedExpenseForm";
import { MarkFixedExpensePaidDialog } from "@/components/fixed-expenses/MarkFixedExpensePaidDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { getMonthlyForecast } from "@/lib/finance/forecastEngine";
import { monthStartIso, useFixedExpenseStore } from "@/stores/fixedExpenseStore";
import { useTransactionStore } from "@/stores/transactionStore";
import type { FixedExpense } from "@/types/fixedExpenses";

export function FixedExpensesPage() {
  const currentDate = useMemo(() => new Date(), []);
  const transactions = useTransactionStore((state) => state.transactions);
  const monthlyBudget = useTransactionStore((state) => state.monthlyBudget);
  const fixedExpenses = useFixedExpenseStore((state) => state.fixedExpenses);
  const occurrences = useFixedExpenseStore((state) => state.occurrences);
  const skipThisMonth = useFixedExpenseStore((state) => state.skipThisMonth);
  const deleteFixedExpense = useFixedExpenseStore((state) => state.deleteFixedExpense);
  const [showForm, setShowForm] = useState(false);
  const [editingFixedExpense, setEditingFixedExpense] = useState<FixedExpense | undefined>();
  const [payingFixedExpense, setPayingFixedExpense] = useState<FixedExpense | null>(null);
  const [deletingFixedExpense, setDeletingFixedExpense] = useState<FixedExpense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const forecast = useMemo(
    () =>
      getMonthlyForecast({
        transactions,
        fixedExpenses,
        fixedExpenseOccurrences: occurrences,
        monthlyBudget,
        targetMonth: currentDate,
      }),
    [currentDate, fixedExpenses, monthlyBudget, occurrences, transactions],
  );
  const activeFixedExpenses = forecast.fixedExpenseItems.map((item) => item.fixedExpense);
  const paidCount = forecast.fixedExpenseItems.filter((item) => item.status === "paid").length;
  const skippedCount = forecast.fixedExpenseItems.filter((item) => item.status === "skipped").length;
  const pendingCount = forecast.fixedExpenseItems.filter((item) => item.status === "pending").length;

  const handleSkip = async (fixedExpense: FixedExpense) => {
    await skipThisMonth({
      fixedExpenseId: fixedExpense.id,
      occurrenceMonth: monthStartIso(currentDate),
    });
  };

  const confirmDelete = async () => {
    if (!deletingFixedExpense) {
      return;
    }

    setIsDeleting(true);
    await deleteFixedExpense(deletingFixedExpense.id);
    setIsDeleting(false);
    setDeletingFixedExpense(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-[1.6rem] bg-white/68 p-4 shadow-soft md:flex-row md:items-center md:justify-between">
        <div>
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-primary">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-normal text-foreground">Gastos fijos</h1>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">Compromisos mensuales esperados, separados de tus movimientos reales.</p>
        </div>
        <Button onClick={() => {
          setEditingFixedExpense(undefined);
          setShowForm((value) => !value);
        }}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Crear gasto fijo
        </Button>
      </div>

      <section className="grid gap-3 sm:grid-cols-4">
        <SummaryTile label="Esperado fijo" value={formatCurrency(activeFixedExpenses.reduce((total, item) => total + item.amount, 0))} />
        <SummaryTile label="Pendientes" value={`${pendingCount}`} />
        <SummaryTile label="Pagados" value={`${paidCount}`} />
        <SummaryTile label="Omitidos" value={`${skippedCount}`} />
      </section>

      {(showForm || editingFixedExpense) && (
        <FixedExpenseForm
          fixedExpense={editingFixedExpense}
          onSaved={() => {
            setShowForm(false);
            setEditingFixedExpense(undefined);
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingFixedExpense(undefined);
          }}
        />
      )}

      <section className="space-y-3">
        {forecast.fixedExpenseItems.length === 0 ? (
          <Card className="p-6 text-center">
            <CalendarClock className="mx-auto h-8 w-8 text-primary" aria-hidden="true" />
            <h2 className="mt-3 text-lg font-bold text-foreground">Sin gastos fijos todavía</h2>
            <p className="mt-1 text-sm text-muted-foreground">Agrega tus compromisos mensuales para mejorar la proyección del presupuesto.</p>
          </Card>
        ) : (
          forecast.fixedExpenseItems.map((item) => (
            <FixedExpenseCard
              key={item.fixedExpense.id}
              fixedExpense={item.fixedExpense}
              occurrence={item.occurrence}
              status={item.status}
              onMarkPaid={setPayingFixedExpense}
              onSkip={handleSkip}
              onEdit={(fixedExpense) => {
                setEditingFixedExpense(fixedExpense);
                setShowForm(true);
              }}
              onDelete={setDeletingFixedExpense}
            />
          ))
        )}
      </section>

      <MarkFixedExpensePaidDialog fixedExpense={payingFixedExpense} targetMonth={currentDate} onClose={() => setPayingFixedExpense(null)} />
      <AppConfirmDialog
        open={Boolean(deletingFixedExpense)}
        eyebrow="Eliminar gasto fijo"
        title={`¿Eliminar ${deletingFixedExpense?.name ?? "este gasto fijo"}?`}
        description="Se eliminará de tus gastos fijos y dejará de considerarse en las proyecciones. Esta acción se sincronizará con tu cuenta cuando haya conexión."
        confirmLabel="Eliminar gasto fijo"
        cancelLabel="Cancelar"
        isConfirming={isDeleting}
        onCancel={() => setDeletingFixedExpense(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-bold uppercase tracking-normal text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-bold text-foreground">{value}</p>
    </Card>
  );
}

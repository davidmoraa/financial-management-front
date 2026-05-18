import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MoneyFluxLogo } from "@/components/brand/MoneyFluxLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PaymentMethodSelect } from "@/components/transactions/PaymentMethodSelect";
import { monthStartIso, useFixedExpenseStore } from "@/stores/fixedExpenseStore";
import type { PaymentMethod } from "@/types/finance";
import type { FixedExpense } from "@/types/fixedExpenses";

const markPaidSchema = z.object({
  amount: z.coerce.number().positive(),
  transactionDate: z.string().min(1),
  paymentMethod: z.enum(["cash", "debit_card", "credit_card", "transfer", "other"]),
  note: z.string().max(160).optional(),
});

type MarkPaidValues = z.infer<typeof markPaidSchema>;

type MarkFixedExpensePaidDialogProps = {
  fixedExpense: FixedExpense | null;
  targetMonth: Date;
  onClose: () => void;
};

export function MarkFixedExpensePaidDialog({ fixedExpense, targetMonth, onClose }: MarkFixedExpensePaidDialogProps) {
  const markPaid = useFixedExpenseStore((state) => state.markPaid);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting },
  } = useForm<MarkPaidValues>({
    resolver: zodResolver(markPaidSchema),
  });

  useEffect(() => {
    if (!fixedExpense) {
      return;
    }

    reset({
      amount: fixedExpense.amount,
      transactionDate: format(new Date(), "yyyy-MM-dd"),
      paymentMethod: fixedExpense.paymentMethod ?? "debit_card",
      note: "",
    });
  }, [fixedExpense, reset]);

  if (!fixedExpense) {
    return null;
  }

  const paymentMethod = watch("paymentMethod") ?? fixedExpense.paymentMethod ?? "debit_card";

  const onSubmit = async (values: MarkPaidValues) => {
    await markPaid({
      fixedExpenseId: fixedExpense.id,
      occurrenceMonth: monthStartIso(targetMonth),
      amount: values.amount,
      transactionDate: values.transactionDate,
      paymentMethod: values.paymentMethod,
      note: values.note,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end bg-slate-950/55 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-5 backdrop-blur-[4px] sm:items-center sm:justify-center">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="mark-paid-title"
        className="max-h-[calc(100dvh-1.5rem)] w-full max-w-[30rem] overflow-hidden rounded-[1.45rem] border border-white bg-white shadow-[0_30px_90px_-34px_rgba(2,44,34,0.65)]"
      >
        <div className="h-1.5 bg-gradient-to-r from-teal-600 via-emerald-400 to-lime-300" />
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[calc(100dvh-1.5rem)] flex-col">
          <header className="shrink-0 p-5 pb-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <MoneyFluxLogo size="sm" className="h-8 w-8 rounded-xl shadow-none ring-1 ring-teal-100" />
                <span className="text-sm font-bold text-slate-950">Money Flux</span>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                Pago fijo
              </span>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h2 id="mark-paid-title" className="text-xl font-bold leading-7 text-slate-950">
                  Marcar como pagado
                </h2>
                <p className="mt-1 truncate text-sm font-semibold text-slate-600">{fixedExpense.name}</p>
              </div>
            </div>
          </header>

          <div className="flex-1 space-y-5 overflow-y-auto px-5 pb-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="paid-amount">Monto</Label>
                <Input id="paid-amount" type="number" min="0" step="0.01" {...register("amount")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paid-date">Fecha de pago</Label>
                <Input id="paid-date" type="date" {...register("transactionDate")} />
              </div>
            </div>

            <section className="space-y-3">
              <Label>Método de pago</Label>
              <PaymentMethodSelect
                value={paymentMethod}
                onChange={(nextPaymentMethod) => setValue("paymentMethod", nextPaymentMethod, { shouldValidate: true })}
              />
            </section>

            <div className="space-y-2">
              <Label htmlFor="paid-note">Nota opcional</Label>
              <Textarea id="paid-note" maxLength={160} {...register("note")} className="min-h-24" />
            </div>
          </div>

          <footer className="grid shrink-0 gap-2 border-t border-slate-100 bg-white/95 p-4 sm:grid-cols-2">
            <Button type="button" variant="outline" className="h-12 rounded-2xl" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="h-12 rounded-2xl" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Confirmar pago"}
            </Button>
          </footer>
        </form>
      </section>
    </div>
  );
}

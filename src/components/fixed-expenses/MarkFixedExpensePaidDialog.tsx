import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/35 p-3 backdrop-blur-sm sm:items-center sm:justify-center">
      <Card className="w-full max-w-lg overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Marcar como pagado</h2>
              <p className="mt-1 text-sm text-muted-foreground">{fixedExpense.name}</p>
            </div>
          </div>

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
            <Textarea id="paid-note" maxLength={160} {...register("note")} />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Confirmar pago
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

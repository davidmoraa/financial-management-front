import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, FileText, Repeat, Save, WalletCards } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CategoryQuickSelect } from "@/components/transactions/CategoryQuickSelect";
import { PaymentMethodSelect } from "@/components/transactions/PaymentMethodSelect";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCategoryStore } from "@/stores/categoryStore";
import { useFixedExpenseStore } from "@/stores/fixedExpenseStore";
import type { PaymentMethod } from "@/types/finance";
import type { FixedExpense } from "@/types/fixedExpenses";

const fixedExpenseFormSchema = z
  .object({
    name: z.string().trim().min(1, "Escribe un nombre"),
    amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
    categoryId: z.string().min(1, "Selecciona una categoría"),
    paymentMethod: z.enum(["cash", "debit_card", "credit_card", "transfer", "other"]),
    paymentWindowStartDay: z.coerce.number().int().min(1).max(31),
    paymentWindowEndDay: z.coerce.number().int().min(1).max(31),
    activeFromMonth: z.string().min(1, "Selecciona el mes inicial"),
    activeUntilMonth: z.string().optional(),
    includeInForecast: z.boolean(),
    note: z.string().max(160).optional(),
  })
  .refine((value) => value.paymentWindowEndDay >= value.paymentWindowStartDay, {
    path: ["paymentWindowEndDay"],
    message: "La ventana debe terminar el mismo día o después",
  })
  .refine((value) => !value.activeUntilMonth || value.activeUntilMonth >= value.activeFromMonth, {
    path: ["activeUntilMonth"],
    message: "El mes final no puede ser anterior",
  });

export type FixedExpenseFormValues = z.infer<typeof fixedExpenseFormSchema>;

type FixedExpenseFormProps = {
  fixedExpense?: FixedExpense;
  onSaved?: () => void;
  onCancel?: () => void;
};

const currentMonth = () => new Date().toISOString().slice(0, 7);
const toMonthStart = (month: string) => `${month}-01`;
const toMonthInput = (date?: string) => date?.slice(0, 7) ?? "";

export function FixedExpenseForm({ fixedExpense, onSaved, onCancel }: FixedExpenseFormProps) {
  const createFixedExpense = useFixedExpenseStore((state) => state.createFixedExpense);
  const updateFixedExpense = useFixedExpenseStore((state) => state.updateFixedExpense);
  const getCategoryById = useCategoryStore((state) => state.getCategoryById);
  const firstExpenseCategory = useCategoryStore((state) => state.getCategoriesByType("expense")[0]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FixedExpenseFormValues>({
    resolver: zodResolver(fixedExpenseFormSchema),
    defaultValues: getDefaultValues(fixedExpense, firstExpenseCategory?.id),
  });

  const categoryId = watch("categoryId");
  const paymentMethod = watch("paymentMethod");
  const includeInForecast = watch("includeInForecast");

  useEffect(() => {
    reset(getDefaultValues(fixedExpense, firstExpenseCategory?.id));
  }, [firstExpenseCategory?.id, fixedExpense, reset]);

  const onSubmit = async (values: FixedExpenseFormValues) => {
    const category = getCategoryById(values.categoryId);
    const payload = {
      name: values.name,
      amount: values.amount,
      categoryId: values.categoryId,
      categoryName: category?.name ?? "Sin categoría",
      paymentMethod: values.paymentMethod,
      paymentWindowStartDay: values.paymentWindowStartDay,
      paymentWindowEndDay: values.paymentWindowEndDay,
      activeFromMonth: toMonthStart(values.activeFromMonth),
      activeUntilMonth: values.activeUntilMonth ? toMonthStart(values.activeUntilMonth) : undefined,
      includeInForecast: values.includeInForecast,
      isActive: true,
      note: values.note,
    };

    if (fixedExpense) {
      await updateFixedExpense(fixedExpense.id, payload);
    } else {
      await createFixedExpense(payload);
      reset(getDefaultValues(undefined, firstExpenseCategory?.id));
    }

    onSaved?.();
  };

  return (
    <Card className="overflow-hidden">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-5 md:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-100 text-primary">
            <Repeat className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-normal text-foreground">
              {fixedExpense ? "Editar gasto fijo" : "Nuevo gasto fijo"}
            </h2>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">Define un compromiso mensual sin registrarlo como gasto real.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-2">
            <Label htmlFor="fixed-name">Nombre</Label>
            <Input id="fixed-name" placeholder="Renta, internet, seguro..." {...register("name")} />
            {errors.name && <p className="text-sm font-semibold text-red-600">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="fixed-amount">Monto</Label>
            <Input id="fixed-amount" type="number" inputMode="decimal" step="0.01" min="0" {...register("amount")} />
            {errors.amount && <p className="text-sm font-semibold text-red-600">{errors.amount.message}</p>}
          </div>
        </div>

        <section className="space-y-3">
          <Label>Categoría</Label>
          <CategoryQuickSelect type="expense" value={categoryId} onChange={(next) => setValue("categoryId", next, { shouldValidate: true })} />
          {errors.categoryId && <p className="text-sm font-semibold text-red-600">{errors.categoryId.message}</p>}
        </section>

        <section className="space-y-3">
          <Label className="flex items-center gap-2">
            <WalletCards className="h-4 w-4 text-primary" aria-hidden="true" />
            Método sugerido
          </Label>
          <PaymentMethodSelect
            value={paymentMethod}
            onChange={(nextPaymentMethod) => setValue("paymentMethod", nextPaymentMethod, { shouldValidate: true })}
          />
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fixed-start-day">Día inicial de pago</Label>
            <Input id="fixed-start-day" type="number" min={1} max={31} {...register("paymentWindowStartDay")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fixed-end-day">Día final de pago</Label>
            <Input id="fixed-end-day" type="number" min={1} max={31} {...register("paymentWindowEndDay")} />
            {errors.paymentWindowEndDay && <p className="text-sm font-semibold text-red-600">{errors.paymentWindowEndDay.message}</p>}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fixed-active-from" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" />
              Activo desde
            </Label>
            <Input id="fixed-active-from" type="month" {...register("activeFromMonth")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fixed-active-until">Activo hasta opcional</Label>
            <Input id="fixed-active-until" type="month" {...register("activeUntilMonth")} />
            {errors.activeUntilMonth && <p className="text-sm font-semibold text-red-600">{errors.activeUntilMonth.message}</p>}
          </div>
        </div>

        <label className="flex items-start gap-3 rounded-2xl border border-teal-100 bg-teal-50/70 p-4 text-sm font-semibold text-teal-900">
          <input
            type="checkbox"
            checked={includeInForecast}
            onChange={(event) => setValue("includeInForecast", event.target.checked, { shouldValidate: true })}
            className="mt-1 h-4 w-4 rounded border-teal-300 text-primary"
          />
          Incluir este gasto fijo en proyecciones y advertencias mensuales
        </label>

        <div className="space-y-2">
          <Label htmlFor="fixed-note" className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
            Nota opcional
          </Label>
          <Textarea id="fixed-note" maxLength={160} placeholder="Contrato, referencia o detalle breve" {...register("note")} />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            <Save className="h-4 w-4" aria-hidden="true" />
            Guardar
          </Button>
        </div>
      </form>
    </Card>
  );
}

function getDefaultValues(fixedExpense?: FixedExpense, fallbackCategoryId = ""): FixedExpenseFormValues {
  return {
    name: fixedExpense?.name ?? "",
    amount: fixedExpense?.amount ?? (undefined as unknown as number),
    categoryId: fixedExpense?.categoryId ?? fallbackCategoryId,
    paymentMethod: fixedExpense?.paymentMethod ?? ("debit_card" as PaymentMethod),
    paymentWindowStartDay: fixedExpense?.paymentWindowStartDay ?? 1,
    paymentWindowEndDay: fixedExpense?.paymentWindowEndDay ?? 5,
    activeFromMonth: toMonthInput(fixedExpense?.activeFromMonth) || currentMonth(),
    activeUntilMonth: toMonthInput(fixedExpense?.activeUntilMonth),
    includeInForecast: fixedExpense?.includeInForecast ?? true,
    note: fixedExpense?.note ?? "",
  };
}

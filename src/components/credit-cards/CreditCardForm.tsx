import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Save } from "lucide-react";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CreditCard as CreditCardModel, CreditCardInput } from "@/types/creditCards";

const creditCardFormSchema = z.object({
  name: z.string().trim().min(1, "Ponle un nombre a la tarjeta."),
  bankName: z.string().trim().optional(),
  lastFourDigits: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^\d{4}$/.test(value), "Usa exactamente 4 dígitos."),
  creditLimit: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce.number().positive("El límite debe ser mayor a 0.").optional(),
  ),
  statementClosingDay: z.coerce.number().int().min(1, "Día inválido.").max(31, "Día inválido."),
  paymentDueDay: z.coerce.number().int().min(1, "Día inválido.").max(31, "Día inválido."),
  paymentDueMonthOffset: z.coerce
    .number()
    .refine((value) => value === 0 || value === 1)
    .transform((value) => value as 0 | 1),
  color: z.string().trim().optional(),
});

type CreditCardFormValues = z.infer<typeof creditCardFormSchema>;

type CreditCardFormProps = {
  initialValue?: CreditCardModel;
  isSubmitting?: boolean;
  onCancel?: () => void;
  onSubmit: (input: CreditCardInput) => Promise<void> | void;
};

export function CreditCardForm({ initialValue, isSubmitting, onCancel, onSubmit }: CreditCardFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreditCardFormValues>({
    resolver: zodResolver(creditCardFormSchema),
    defaultValues: toFormValues(initialValue),
  });

  useEffect(() => {
    reset(toFormValues(initialValue));
  }, [initialValue, reset]);

  const submit = async (values: CreditCardFormValues) => {
    await onSubmit({
      name: values.name,
      bankName: values.bankName || null,
      lastFourDigits: values.lastFourDigits || null,
      creditLimit: values.creditLimit ?? null,
      statementClosingDay: values.statementClosingDay,
      paymentDueDay: values.paymentDueDay,
      paymentDueMonthOffset: values.paymentDueMonthOffset,
      color: values.color || null,
      isActive: initialValue?.isActive ?? true,
    });

    if (!initialValue) {
      reset(toFormValues());
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-100 text-primary">
          <CreditCard className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">{initialValue ? "Editar tarjeta" : "Nueva tarjeta"}</h2>
          <p className="text-sm font-medium leading-6 text-muted-foreground">
            Guarda solo lo necesario para identificar pagos a crédito.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nombre" error={errors.name?.message}>
          <Input placeholder="Tarjeta personal" {...register("name")} />
        </Field>
        <Field label="Banco" error={errors.bankName?.message}>
          <Input placeholder="BBVA, Nu, Hey..." {...register("bankName")} />
        </Field>
        <Field label="Últimos 4 dígitos" error={errors.lastFourDigits?.message}>
          <Input inputMode="numeric" maxLength={4} placeholder="1234" {...register("lastFourDigits")} />
        </Field>
        <Field label="Límite de crédito" error={errors.creditLimit?.message}>
          <Input type="number" inputMode="decimal" min="0" step="0.01" placeholder="25000" {...register("creditLimit")} />
        </Field>
        <Field label="Día de corte" error={errors.statementClosingDay?.message}>
          <Input type="number" inputMode="numeric" min="1" max="31" {...register("statementClosingDay")} />
        </Field>
        <Field label="Día límite de pago" error={errors.paymentDueDay?.message}>
          <Input type="number" inputMode="numeric" min="1" max="31" {...register("paymentDueDay")} />
        </Field>
        <Field label="Pago vence" error={errors.paymentDueMonthOffset?.message}>
          <div className="grid grid-cols-2 gap-2">
            <label className="rounded-2xl border border-border bg-white/75 p-3 text-sm font-bold">
              <input className="mr-2 accent-primary" type="radio" value={0} {...register("paymentDueMonthOffset")} />
              Mismo mes
            </label>
            <label className="rounded-2xl border border-border bg-white/75 p-3 text-sm font-bold">
              <input className="mr-2 accent-primary" type="radio" value={1} {...register("paymentDueMonthOffset")} />
              Mes siguiente
            </label>
          </div>
        </Field>
        <Field label="Color" error={errors.color?.message}>
          <Input type="color" className="h-12 p-2" {...register("color")} />
        </Field>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className={onCancel ? "" : "sm:col-span-2"}>
          <Save className="h-4 w-4" aria-hidden="true" />
          {initialValue ? "Guardar cambios" : "Crear tarjeta"}
        </Button>
      </div>
    </form>
  );
}

function toFormValues(card?: CreditCardModel): CreditCardFormValues {
  return {
    name: card?.name ?? "",
    bankName: card?.bankName ?? "",
    lastFourDigits: card?.lastFourDigits ?? "",
    creditLimit: card?.creditLimit,
    statementClosingDay: card?.statementClosingDay ?? 12,
    paymentDueDay: card?.paymentDueDay ?? 5,
    paymentDueMonthOffset: card?.paymentDueMonthOffset ?? 1,
    color: card?.color ?? "#0f766e",
  };
}

function Field({ children, error, label }: { children: ReactNode; error?: string; label: string }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
    </div>
  );
}

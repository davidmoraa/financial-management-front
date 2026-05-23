import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Target } from "lucide-react";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SavingMilestone, SavingMilestoneInput } from "@/types/savingMilestones";

const formSchema = z.object({
  name: z.string().trim().min(1, "Ponle nombre a tu meta."),
  targetAmount: z.coerce.number().positive("El monto objetivo debe ser mayor a 0."),
  currentAmount: z.coerce.number().min(0, "El monto actual no puede ser negativo."),
  targetDate: z.string().min(1, "Elige una fecha objetivo."),
  priority: z.enum(["essential", "important", "nice_to_have"]),
  contributionFrequency: z.enum(["daily", "weekly", "biweekly", "monthly"]),
  autoReserve: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

type SavingMilestoneFormProps = {
  initialValue?: SavingMilestone;
  isSubmitting?: boolean;
  onCancel?: () => void;
  onSubmit: (input: SavingMilestoneInput) => Promise<void> | void;
};

const priorityOptions = [
  { value: "essential", label: "Esencial" },
  { value: "important", label: "Importante" },
  { value: "nice_to_have", label: "Deseable" },
] as const;

const frequencyOptions = [
  { value: "daily", label: "Diaria" },
  { value: "weekly", label: "Semanal" },
  { value: "biweekly", label: "Quincenal" },
  { value: "monthly", label: "Mensual" },
] as const;

export function SavingMilestoneForm({ initialValue, isSubmitting, onCancel, onSubmit }: SavingMilestoneFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: toFormValues(initialValue),
  });

  useEffect(() => {
    reset(toFormValues(initialValue));
  }, [initialValue, reset]);

  const submit = async (values: FormValues) => {
    await onSubmit({
      name: values.name,
      targetAmount: values.targetAmount,
      currentAmount: values.currentAmount,
      targetDate: values.targetDate,
      priority: values.priority,
      contributionFrequency: values.contributionFrequency,
      autoReserve: values.autoReserve,
      isActive: initialValue?.isActive ?? true,
    });

    if (!initialValue) {
      reset(toFormValues());
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-100 text-lime-700">
          <Target className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-black text-foreground">{initialValue ? "Editar meta" : "Nueva meta de ahorro"}</h2>
          <p className="text-sm font-medium leading-6 text-muted-foreground">
            Define el objetivo y Money Flux calculará el ritmo necesario para llegar a tiempo.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nombre de la meta" htmlFor="saving-name" error={errors.name?.message}>
          <Input id="saving-name" placeholder="Viaje, enganche, emergencia..." {...register("name")} />
        </Field>
        <Field label="Fecha objetivo" htmlFor="saving-target-date" error={errors.targetDate?.message}>
          <Input id="saving-target-date" type="date" {...register("targetDate")} />
        </Field>
        <Field label="Monto objetivo" htmlFor="saving-target-amount" error={errors.targetAmount?.message}>
          <Input id="saving-target-amount" type="number" inputMode="decimal" min="0" step="0.01" placeholder="20000" {...register("targetAmount")} />
        </Field>
        <Field label="Monto actual" htmlFor="saving-current-amount" error={errors.currentAmount?.message}>
          <Input id="saving-current-amount" type="number" inputMode="decimal" min="0" step="0.01" placeholder="0" {...register("currentAmount")} />
        </Field>
      </div>

      <Field label="Prioridad" error={errors.priority?.message}>
        <div className="grid gap-2 sm:grid-cols-3">
          {priorityOptions.map((option) => (
            <label key={option.value} className="rounded-2xl border border-border bg-white/75 p-3 text-sm font-bold">
              <input className="mr-2 accent-primary" type="radio" value={option.value} {...register("priority")} />
              {option.label}
            </label>
          ))}
        </div>
      </Field>

      <Field label="Frecuencia sugerida" error={errors.contributionFrequency?.message}>
        <div className="grid gap-2 sm:grid-cols-4">
          {frequencyOptions.map((option) => (
            <label key={option.value} className="rounded-2xl border border-border bg-white/75 p-3 text-sm font-bold">
              <input className="mr-2 accent-primary" type="radio" value={option.value} {...register("contributionFrequency")} />
              {option.label}
            </label>
          ))}
        </div>
      </Field>

      <label className="flex items-start gap-3 rounded-2xl border border-teal-100 bg-teal-50/70 p-4 text-sm font-bold text-teal-900">
        <input className="mt-1 accent-primary" type="checkbox" {...register("autoReserve")} />
        <span>
          Auto reservar en mis proyecciones
          <span className="mt-1 block text-xs font-semibold leading-5 text-teal-700">
            Quedará preparado para descontarlo del flujo disponible en una fase posterior.
          </span>
        </span>
      </label>

      <div className="grid gap-2 sm:grid-cols-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className={onCancel ? "" : "sm:col-span-2"}>
          <Save className="h-4 w-4" aria-hidden="true" />
          {initialValue ? "Guardar cambios" : "Crear meta"}
        </Button>
      </div>
    </form>
  );
}

function toFormValues(milestone?: SavingMilestone): FormValues {
  return {
    name: milestone?.name ?? "",
    targetAmount: milestone?.targetAmount ?? ("" as unknown as number),
    currentAmount: milestone?.currentAmount ?? 0,
    targetDate: milestone?.targetDate ?? "",
    priority: milestone?.priority ?? "important",
    contributionFrequency: milestone?.contributionFrequency ?? "weekly",
    autoReserve: milestone?.autoReserve ?? false,
  };
}

function Field({ children, error, htmlFor, label }: { children: ReactNode; error?: string; htmlFor?: string; label: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
    </div>
  );
}

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Gauge, WalletCards } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MoneyFluxLogo } from "@/components/brand/MoneyFluxLogo";
import {
  hasLocalData,
  LOCAL_DATA_DIALOG_DISMISSED_EVENT,
  LOCAL_DATA_DIALOG_DISMISSED_KEY,
} from "@/components/auth/LocalDataAfterLoginDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { incomeCadenceLabels, normalizeExpectedMonthlyIncome } from "@/lib/finance/incomeCadence";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import type { IncomeCadence } from "@/types/finance";

const budgetSetupSchema = z.object({
  expectedIncomeAmount: z.coerce.number().positive("Ingresa un monto mayor a cero."),
  incomeCadence: z.enum(["monthly", "biweekly", "weekly"]),
});

type BudgetSetupValues = z.infer<typeof budgetSetupSchema>;

export function MonthlyBudgetSetupDialog() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const updateIncomeSettings = useAuthStore((state) => state.updateIncomeSettings);
  const [canShow, setCanShow] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BudgetSetupValues>({
    resolver: zodResolver(budgetSetupSchema),
    defaultValues: { expectedIncomeAmount: undefined as unknown as number, incomeCadence: "monthly" },
  });
  const selectedCadence = watch("incomeCadence");

  const shouldPrompt =
    isAuthenticated &&
    Boolean(user) &&
    !isAuthLoading &&
    (typeof profile?.expectedIncomeAmount !== "number" || profile.expectedIncomeAmount <= 0);

  useEffect(() => {
    if (!shouldPrompt) {
      setCanShow(false);
      return;
    }

    let mounted = true;

    const evaluateVisibility = async () => {
      const localDialogAlreadyHandled = window.sessionStorage.getItem(LOCAL_DATA_DIALOG_DISMISSED_KEY) === "true";
      const blockedByLocalData = !localDialogAlreadyHandled && (await hasLocalData());

      if (mounted) {
        setCanShow(!blockedByLocalData);
      }
    };

    void evaluateVisibility();
    window.addEventListener(LOCAL_DATA_DIALOG_DISMISSED_EVENT, evaluateVisibility);

    return () => {
      mounted = false;
      window.removeEventListener(LOCAL_DATA_DIALOG_DISMISSED_EVENT, evaluateVisibility);
    };
  }, [shouldPrompt]);

  if (!shouldPrompt || !canShow) {
    return null;
  }

  const onSubmit = async (values: BudgetSetupValues) => {
    setSubmitError(null);
    try {
      await updateIncomeSettings({
        expectedIncomeAmount: values.expectedIncomeAmount,
        incomeCadence: values.incomeCadence,
        monthlyBudget: normalizeExpectedMonthlyIncome(values.expectedIncomeAmount, values.incomeCadence),
      });
    } catch {
      setSubmitError("No pudimos guardar tu ingreso esperado. Revisa tu conexión e intenta de nuevo.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/55 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6 backdrop-blur-[4px] sm:items-center sm:justify-center">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="budget-setup-title"
        className="w-full max-w-[27rem] overflow-hidden rounded-[1.45rem] border border-white bg-white shadow-[0_30px_90px_-34px_rgba(2,44,34,0.65)]"
      >
        <div className="h-1.5 bg-gradient-to-r from-teal-600 via-emerald-400 to-lime-300" />
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <MoneyFluxLogo size="md" className="shrink-0 shadow-none ring-1 ring-teal-100" />
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">Primer ajuste</p>
              <h2 id="budget-setup-title" className="mt-1 text-xl font-bold leading-7 text-slate-950">
                Define tu ingreso esperado
              </h2>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                Lo usaremos para calcular balance, presupuesto disponible y ritmo seguro según cómo recibes dinero.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-teal-100 bg-teal-50/75 p-4">
            <Label htmlFor="monthly-budget" className="flex items-center justify-center gap-2 text-sm font-bold text-primary">
              <WalletCards className="h-4 w-4" aria-hidden="true" />
              Ingreso por periodo en MXN
            </Label>
            <div className="mt-3 flex items-center rounded-[1.35rem] border border-teal-100 bg-white px-4 shadow-soft focus-within:border-primary focus-within:ring-4 focus-within:ring-teal-100">
              <span className="text-2xl font-bold text-slate-500">$</span>
              <Input
                id="monthly-budget"
                type="number"
                min="1"
                step="0.01"
                inputMode="decimal"
                placeholder="0"
                className="h-16 border-0 bg-transparent text-center text-4xl font-bold shadow-none focus-visible:ring-0"
                {...register("expectedIncomeAmount")}
              />
            </div>
            {errors.expectedIncomeAmount && <p className="mt-2 text-center text-sm font-semibold text-red-600">{errors.expectedIncomeAmount.message}</p>}

            <div className="mt-4 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Frecuencia de ingreso">
              {(Object.keys(incomeCadenceLabels) as IncomeCadence[]).map((cadence) => (
                <button
                  key={cadence}
                  type="button"
                  role="radio"
                  aria-checked={selectedCadence === cadence}
                  onClick={() => setValue("incomeCadence", cadence, { shouldValidate: true })}
                  className={cn(
                    "h-10 rounded-2xl border px-2 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    selectedCadence === cadence
                      ? "border-primary bg-white text-primary shadow-soft"
                      : "border-teal-100 bg-white/55 text-slate-600",
                  )}
                >
                  {incomeCadenceLabels[cadence]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-lime-200 bg-lime-50 px-4 py-3 text-sm font-semibold leading-5 text-teal-950">
            <Gauge className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            Podrás registrar movimientos aunque estés offline. Este ajuste se guarda en tu perfil cuando hay conexión.
          </div>

          {submitError && <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{submitError}</p>}

          <Button type="submit" size="lg" className="mt-5 w-full" disabled={isSubmitting || isAuthLoading}>
            {isSubmitting || isAuthLoading ? "Guardando..." : "Guardar ingreso esperado"}
          </Button>
        </form>
      </section>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarDays, CloudOff, Coins, FileText, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SuccessPulse } from "@/components/feedback/SuccessPulse";
import { CategoryQuickSelect } from "@/components/transactions/CategoryQuickSelect";
import { PaymentMethodSelect } from "@/components/transactions/PaymentMethodSelect";
import { TransactionTypeToggle } from "@/components/transactions/TransactionTypeToggle";
import { transactionSchema, type TransactionFormValues } from "@/schemas/transactionSchema";
import { useNetworkStore } from "@/stores/networkStore";
import { useCategoryStore } from "@/stores/categoryStore";
import { useTransactionStore } from "@/stores/transactionStore";
import type { PaymentMethod, TransactionType } from "@/types/finance";

const today = () => format(new Date(), "yyyy-MM-dd");

function getInitialValues(type: TransactionType = "expense", paymentMethod: PaymentMethod = "debit_card"): TransactionFormValues {
  const firstCategory = useCategoryStore
    .getState()
    .getCategoriesByType(type)
    .at(0);

  return {
    type,
    amount: "" as unknown as number,
    categoryId: firstCategory?.id ?? "",
    paymentMethod,
    transactionDate: today(),
    note: "",
  };
}

export function TransactionForm() {
  const addTransaction = useTransactionStore((state) => state.addTransaction);
  const isOnline = useNetworkStore((state) => state.isOnline);
  const getCategoriesByType = useCategoryStore((state) => state.getCategoriesByType);
  const [showSuccess, setShowSuccess] = useState(false);
  const [offlineSaved, setOfflineSaved] = useState(false);
  const [savedReward, setSavedReward] = useState<{
    amount: number;
    categoryName: string;
    type: TransactionType;
  }>();
  const successTimer = useRef<number | undefined>(undefined);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: getInitialValues(),
  });

  const type = watch("type");
  const categoryId = watch("categoryId");
  const paymentMethod = watch("paymentMethod");

  useEffect(() => {
    const validCategories = getCategoriesByType(type);
    const categoryStillValid = validCategories.some((category) => category.id === categoryId);

    if (!categoryStillValid) {
      setValue("categoryId", validCategories[0]?.id ?? "", { shouldValidate: true });
    }
  }, [categoryId, getCategoriesByType, setValue, type]);

  useEffect(() => {
    return () => {
      if (successTimer.current) {
        window.clearTimeout(successTimer.current);
      }
    };
  }, []);

  const onSubmit = async (values: TransactionFormValues) => {
    const transaction = await addTransaction(values);
    reset(getInitialValues(values.type, values.paymentMethod));
    setSavedReward({
      amount: transaction.amount,
      categoryName: transaction.categoryName,
      type: transaction.type,
    });
    setOfflineSaved(!isOnline);
    setShowSuccess(true);

    if (successTimer.current) {
      window.clearTimeout(successTimer.current);
    }
    successTimer.current = window.setTimeout(() => {
      setShowSuccess(false);
      setOfflineSaved(false);
      setSavedReward(undefined);
    }, 2200);
  };

  return (
    <>
      <SuccessPulse
        amount={savedReward?.amount}
        categoryName={savedReward?.categoryName}
        show={showSuccess}
        type={savedReward?.type}
      />
      <Card className="overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-5 md:p-7">
          <TransactionTypeToggle
            value={type}
            onChange={(nextType) => {
              const firstCategory = getCategoriesByType(nextType)[0];
              setValue("type", nextType, { shouldValidate: true });
              setValue("categoryId", firstCategory?.id ?? "", { shouldValidate: true });
            }}
          />

          <motion.div
            key={type}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="rounded-[1.4rem] bg-teal-50/80 p-4"
          >
            <Label htmlFor="amount" className="flex items-center justify-center gap-2 text-primary">
              <Coins className="h-4 w-4" aria-hidden="true" />
              Monto
            </Label>
            <div className="mt-3 flex items-center rounded-[1.4rem] border border-teal-100 bg-white px-4 shadow-soft focus-within:border-primary focus-within:ring-4 focus-within:ring-teal-100">
              <span className="text-3xl font-bold text-muted-foreground">$</span>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                placeholder="0"
                className="h-20 min-w-0 flex-1 bg-transparent px-3 text-center text-5xl font-bold tracking-normal text-foreground outline-none placeholder:text-teal-900/20"
                {...register("amount")}
              />
            </div>
            {errors.amount && <p className="mt-2 text-center text-sm font-semibold text-red-600">{errors.amount.message}</p>}
          </motion.div>

          <section className="space-y-3">
            <Label>Categoría</Label>
            <CategoryQuickSelect
              type={type}
              value={categoryId}
              onChange={(nextCategoryId) => setValue("categoryId", nextCategoryId, { shouldValidate: true })}
            />
            {errors.categoryId && <p className="text-sm font-semibold text-red-600">{errors.categoryId.message}</p>}
          </section>

          <section className="space-y-3">
            <Label>Método de pago</Label>
            <PaymentMethodSelect
              value={paymentMethod}
              onChange={(nextPaymentMethod) => setValue("paymentMethod", nextPaymentMethod, { shouldValidate: true })}
            />
            {errors.paymentMethod && <p className="text-sm font-semibold text-red-600">{errors.paymentMethod.message}</p>}
          </section>

          <div className="grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
            <div className="space-y-2">
              <Label htmlFor="transactionDate" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" />
                Fecha
              </Label>
              <Input id="transactionDate" type="date" {...register("transactionDate")} />
              {errors.transactionDate && <p className="text-sm font-semibold text-red-600">{errors.transactionDate.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="note" className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
                Nota opcional
              </Label>
              <Textarea id="note" maxLength={160} placeholder="Algo breve para recordarlo después" {...register("note")} />
              {errors.note && <p className="text-sm font-semibold text-red-600">{errors.note.message}</p>}
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full text-base" disabled={isSubmitting}>
            <Save className="h-5 w-5" aria-hidden="true" />
            Guardar movimiento
          </Button>

          {offlineSaved && (
            <div className="flex items-start gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold leading-5 text-amber-800">
              <CloudOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              Guardado en este dispositivo. Se sincronizará cuando vuelva internet.
            </div>
          )}
        </form>
      </Card>
    </>
  );
}

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, TrendingUp, WalletCards } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { TransactionType } from "@/types/finance";

type MovementRegisteredFeedbackProps = {
  amount?: number;
  categoryName?: string;
  projectionCopy?: string;
  show: boolean;
  type?: TransactionType;
};

export function MovementRegisteredFeedback({
  amount,
  categoryName,
  projectionCopy,
  show,
  type = "expense",
}: MovementRegisteredFeedbackProps) {
  const shouldReduceMotion = useReducedMotion();
  const isIncome = type === "income";
  const title = isIncome ? "Ingreso registrado" : "Movimiento registrado";
  const detail = amount
    ? `${formatCurrency(amount)} en ${categoryName ?? "tu registro"}`
    : "Tu registro ya suma claridad al periodo.";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          aria-live="polite"
          className="pointer-events-none fixed inset-x-0 top-20 z-50 mx-auto w-[min(92vw,27rem)] px-3"
          role="status"
        >
          <motion.div
            className="relative overflow-hidden rounded-[1.65rem] border border-white bg-white/95 p-5 text-left shadow-[0_30px_90px_-34px_rgba(2,44,34,0.65)] backdrop-blur"
            initial={shouldReduceMotion ? false : { opacity: 0, y: -12, scale: 0.96 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-teal-700 via-primary to-lime-300" />
            <div className="flex items-start gap-4">
              <motion.div
                className={cn(
                  "flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl shadow-lift",
                  isIncome ? "bg-emerald-600 text-white" : "bg-primary text-primary-foreground",
                )}
                initial={shouldReduceMotion ? false : { scale: 0.82 }}
                animate={shouldReduceMotion ? undefined : { scale: [0.82, 1.06, 1] }}
                transition={{ duration: 0.42, ease: "easeOut" }}
              >
                <Check className="h-7 w-7" aria-hidden="true" />
              </motion.div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-black uppercase tracking-normal text-primary">Proyección actualizada</p>
                <h2 className="mt-1 text-xl font-black tracking-normal text-foreground">{title}</h2>
                <p className="mt-1 text-sm font-semibold leading-6 text-muted-foreground">{detail}</p>
              </div>
            </div>

            <div className="mt-4 rounded-[1.25rem] border border-teal-100 bg-teal-50/80 p-4">
              <div className="flex items-start gap-3">
                <WalletCards className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <p className="text-sm font-bold leading-6 text-teal-900">
                  {projectionCopy ?? "Movimiento registrado. Tu proyección se actualizó."}
                </p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-lime-400"
                  initial={shouldReduceMotion ? false : { width: "18%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.7, ease: "easeOut" }}
                />
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs font-black uppercase tracking-normal text-teal-700">
                <TrendingUp className="h-4 w-4" aria-hidden="true" />
                Claridad financiera al día
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

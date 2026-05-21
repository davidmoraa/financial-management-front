import { AnimatePresence, motion } from "motion/react";
import { Check, Sparkles, Trophy } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import type { TransactionType } from "@/types/finance";

type SuccessPulseProps = {
  amount?: number;
  categoryName?: string;
  show: boolean;
  type?: TransactionType;
};

export function SuccessPulse({ amount, categoryName, show, type = "expense" }: SuccessPulseProps) {
  const tone = type === "income" ? "Ingreso registrado" : "Movimiento registrado";

  return (
    <AnimatePresence>
      {show && (
        <motion.div className="pointer-events-none fixed inset-x-0 top-20 z-50 mx-auto w-[min(92vw,26rem)] px-3">
          <motion.div
            className="relative overflow-hidden rounded-[1.65rem] border border-white bg-white/95 p-5 text-center shadow-[0_30px_90px_-34px_rgba(2,44,34,0.65)] backdrop-blur"
            initial={{ opacity: 0, y: -16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 360, damping: 24 }}
          >
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-teal-600 via-emerald-400 to-lime-300" />
            <RewardBurst />
            <motion.div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-lift"
              initial={{ rotate: -8, scale: 0.65 }}
              animate={{ rotate: [ -8, 6, 0 ], scale: [0.65, 1.12, 1] }}
              transition={{ duration: 0.55, ease: "easeOut" }}
            >
              <Check className="h-8 w-8" aria-hidden="true" />
            </motion.div>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-normal text-primary">
              <Trophy className="h-4 w-4 text-lime-600" aria-hidden="true" />
              Progreso financiero
            </div>
            <h2 className="mt-2 text-2xl font-black tracking-normal text-foreground">{tone}</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-muted-foreground">
              {amount ? `${formatCurrency(amount)} en ${categoryName ?? "tu registro"}` : "Tu registro ya suma al control del periodo."}
            </p>
            <div className="mt-4 rounded-2xl bg-teal-50 px-4 py-3 text-sm font-black text-teal-800">
              +1 registro para mantener tu ritmo
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function RewardBurst() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[0, 1, 2, 3, 4].map((index) => (
        <motion.span
          key={index}
          className="absolute left-1/2 top-10 text-lime-500"
          initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
          animate={{
            opacity: [0, 1, 0],
            x: [-84, -42, 0, 42, 84][index],
            y: [-10, -34, -46, -34, -10][index],
            scale: [0.4, 1, 0.75],
          }}
          transition={{ duration: 0.9, delay: index * 0.04 }}
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
        </motion.span>
      ))}
    </div>
  );
}

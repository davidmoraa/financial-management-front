import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";

type SuccessPulseProps = {
  show: boolean;
};

export function SuccessPulse({ show }: SuccessPulseProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="pointer-events-none fixed inset-x-0 top-24 z-50 mx-auto flex w-fit items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-lift"
          initial={{ opacity: 0, y: -12, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 420, damping: 26 }}
        >
          <motion.span
            className="flex h-6 w-6 items-center justify-center rounded-full bg-lime-200 text-teal-900"
            initial={{ scale: 0.4 }}
            animate={{ scale: [0.4, 1.18, 1] }}
            transition={{ duration: 0.45 }}
          >
            <Check className="h-4 w-4" aria-hidden="true" />
          </motion.span>
          Movimiento guardado
        </motion.div>
      )}
    </AnimatePresence>
  );
}

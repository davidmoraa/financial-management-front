import { motion, useReducedMotion } from "motion/react";
import { LoaderCircle } from "lucide-react";

export function DashboardSkeleton() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      aria-busy="true"
      aria-label="Cargando dashboard financiero"
      className="rounded-[1.6rem] border border-teal-100 bg-white/78 p-5 shadow-soft"
    >
      <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground">
        <LoaderCircle className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
        Preparando tu lectura financiera...
      </div>

      <div className="mt-5 grid gap-4">
        <SkeletonBlock className="h-56 rounded-[1.8rem]" reduced={shouldReduceMotion} />
        <div className="grid gap-3 md:grid-cols-3">
          <SkeletonBlock className="h-28 rounded-3xl" reduced={shouldReduceMotion} />
          <SkeletonBlock className="h-28 rounded-3xl" reduced={shouldReduceMotion} />
          <SkeletonBlock className="h-28 rounded-3xl" reduced={shouldReduceMotion} />
        </div>
      </div>
    </section>
  );
}

function SkeletonBlock({ className, reduced }: { className: string; reduced: boolean | null }) {
  return (
    <motion.div
      className={`bg-gradient-to-r from-teal-50 via-white to-lime-50 ${className}`}
      initial={reduced ? false : { opacity: 0.58 }}
      animate={reduced ? undefined : { opacity: [0.58, 1, 0.58] }}
      transition={{ duration: 1.8, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
    />
  );
}

import { motion } from "motion/react";
import { ArrowDownRight, ArrowUpRight, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

type BalanceOverviewCardProps = {
  balance: number;
};

export function BalanceOverviewCard({ balance }: BalanceOverviewCardProps) {
  const isPositive = balance >= 0;
  const copy = balance > 6000 ? "Vas bien este mes" : isPositive ? "Balance positivo" : "Cuida el ritmo de gastos";
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Card className="overflow-hidden bg-primary text-primary-foreground">
        <div className="relative p-6">
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-teal-50/80">Balance del mes</p>
              <p className="mt-3 text-4xl font-bold tracking-normal md:text-5xl">{formatCurrency(balance)}</p>
            </div>
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
                isPositive ? "bg-lime-200/22 text-lime-100" : "bg-amber-200/25 text-amber-100",
              )}
            >
              <Icon className="h-6 w-6" aria-hidden="true" />
            </div>
          </div>

          <div className="relative mt-7 flex items-center gap-2 rounded-2xl bg-white/12 px-3 py-2 text-sm font-semibold text-teal-50">
            <ShieldCheck className="h-4 w-4 text-lime-200" aria-hidden="true" />
            {copy}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

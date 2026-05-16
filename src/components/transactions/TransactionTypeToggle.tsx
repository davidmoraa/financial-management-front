import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import type { TransactionType } from "@/types/finance";
import { cn } from "@/lib/utils";

type TransactionTypeToggleProps = {
  value: TransactionType;
  onChange: (value: TransactionType) => void;
};

const options: Array<{ value: TransactionType; label: string; icon: typeof ArrowDownLeft }> = [
  { value: "expense", label: "Gasto", icon: ArrowDownLeft },
  { value: "income", label: "Ingreso", icon: ArrowUpRight },
];

export function TransactionTypeToggle({ value, onChange }: TransactionTypeToggleProps) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-teal-50 p-1" role="radiogroup" aria-label="Tipo de movimiento">
      {options.map((option) => {
        const Icon = option.icon;
        const selected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected ? "bg-white text-primary shadow-soft" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

import { Banknote, CircleEllipsis, CreditCard, Landmark } from "lucide-react";
import type { PaymentMethod } from "@/types/finance";
import { cn } from "@/lib/utils";

type PaymentMethodSelectProps = {
  value: PaymentMethod;
  onChange: (value: PaymentMethod) => void;
};

const methods: Array<{ value: PaymentMethod; label: string; icon: typeof CreditCard }> = [
  { value: "cash", label: "Efectivo", icon: Banknote },
  { value: "debit_card", label: "Débito", icon: CreditCard },
  { value: "credit_card", label: "Crédito", icon: CreditCard },
  { value: "transfer", label: "Transferencia", icon: Landmark },
  { value: "other", label: "Otro", icon: CircleEllipsis },
];

export function PaymentMethodSelect({ value, onChange }: PaymentMethodSelectProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5" role="radiogroup" aria-label="Método de pago">
      {methods.map((method) => {
        const selected = value === method.value;
        const Icon = method.icon;

        return (
          <button
            key={method.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(method.value)}
            className={cn(
              "flex min-h-[70px] flex-col items-center justify-center gap-2 rounded-2xl border px-2 text-center text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected
                ? "border-primary bg-teal-50 text-primary shadow-soft"
                : "border-border bg-white/70 text-muted-foreground hover:bg-white hover:text-foreground",
            )}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            <span className="leading-tight">{method.label}</span>
          </button>
        );
      })}
    </div>
  );
}

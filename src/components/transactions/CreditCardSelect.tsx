import { CreditCard, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import type { CreditCard as CreditCardModel } from "@/types/creditCards";
import { cn } from "@/lib/utils";

type CreditCardSelectProps = {
  cards: CreditCardModel[];
  value?: string;
  onChange: (value: string) => void;
};

export function CreditCardSelect({ cards, value, onChange }: CreditCardSelectProps) {
  if (cards.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-teal-200 bg-teal-50/70 p-4 text-sm font-semibold text-primary">
        <p>Agrega una tarjeta para registrar pagos a crédito.</p>
        <Link to="/credit-cards" className="mt-3 inline-flex items-center gap-2 text-sm font-bold underline-offset-4 hover:underline">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Administrar tarjetas
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Tarjeta de crédito">
      {cards.map((card) => {
        const selected = card.id === value;

        return (
          <button
            key={card.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(card.id)}
            className={cn(
              "flex min-h-[76px] items-center gap-3 rounded-2xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected
                ? "border-primary bg-teal-50 text-primary shadow-soft"
                : "border-border bg-white/75 text-foreground hover:bg-white",
            )}
          >
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-soft"
              style={{ backgroundColor: card.color ?? "#0f766e" }}
            >
              <CreditCard className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold">{card.name}</span>
              <span className="block truncate text-xs font-semibold text-muted-foreground">
                {card.bankName ?? "Tarjeta"} {card.lastFourDigits ? `· ${card.lastFourDigits}` : ""}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

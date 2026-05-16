import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { PaymentMethod } from "@/types/finance";

export const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export function formatCurrency(amount: number) {
  return currencyFormatter.format(amount);
}

export function formatSignedCurrency(amount: number, type: "income" | "expense") {
  const sign = type === "income" ? "+" : "-";
  return `${sign}${formatCurrency(Math.abs(amount))}`;
}

export function formatTransactionDate(date: string) {
  return format(new Date(date), "d MMM yyyy", { locale: es });
}

export function formatShortDate(date: Date) {
  return format(date, "MMMM yyyy", { locale: es });
}

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: "Efectivo",
  debit_card: "Débito",
  credit_card: "Crédito",
  transfer: "Transferencia",
  other: "Otro",
};

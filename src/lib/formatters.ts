import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { PaymentMethod } from "@/types/finance";

export const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export function formatCurrency(amount: number) {
  return currencyFormatter.format(Number.isFinite(amount) ? amount : 0);
}

export function formatSignedCurrency(amount: number, type: "income" | "expense") {
  const sign = type === "income" ? "+" : "-";
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return `${sign}${formatCurrency(Math.abs(safeAmount))}`;
}

export function parseAppDate(date: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? parseISO(date) : new Date(date);
}

export function formatTransactionDate(date: string) {
  return format(parseAppDate(date), "d MMM yyyy", { locale: es });
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

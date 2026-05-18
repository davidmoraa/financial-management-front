import type { IncomeCadence } from "@/types/finance";

export const incomeCadenceLabels: Record<IncomeCadence, string> = {
  monthly: "Mensual",
  biweekly: "Quincenal",
  weekly: "Semanal",
};

export function normalizeExpectedMonthlyIncome(amount: number, cadence: IncomeCadence) {
  if (cadence === "weekly") {
    return roundCurrency((amount * 52) / 12);
  }

  if (cadence === "biweekly") {
    return roundCurrency((amount * 26) / 12);
  }

  return roundCurrency(amount);
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

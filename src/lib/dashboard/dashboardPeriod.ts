import {
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";
import type { DashboardPeriod, DashboardPeriodType } from "@/types/dashboard";

export const dashboardPeriodOptions: Array<{ type: DashboardPeriodType; label: string }> = [
  { type: "monthly", label: "Mes" },
  { type: "biweekly", label: "Quincena" },
  { type: "weekly", label: "Semana" },
];

export function getDashboardPeriod(type: DashboardPeriodType, date: Date): DashboardPeriod {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);

  if (type === "weekly") {
    const weekStart = maxDate(startOfWeek(date, { weekStartsOn: 1 }), monthStart);
    const weekEnd = minDate(endOfWeek(date, { weekStartsOn: 1 }), monthEnd);
    return {
      type,
      label: `Semana del ${format(weekStart, "d MMM", { locale: es })}`,
      shortLabel: "Semana actual",
      startsAt: format(weekStart, "yyyy-MM-dd"),
      endsAt: format(weekEnd, "yyyy-MM-dd"),
    };
  }

  if (type === "biweekly") {
    const isFirstHalf = date.getDate() <= 15;
    const startsAt = isFirstHalf ? monthStart : parseISO(`${format(date, "yyyy-MM")}-16`);
    const endsAt = isFirstHalf ? parseISO(`${format(date, "yyyy-MM")}-15`) : monthEnd;
    return {
      type,
      label: isFirstHalf ? "Primera quincena" : "Segunda quincena",
      shortLabel: isFirstHalf ? "Quincena 1" : "Quincena 2",
      startsAt: format(startsAt, "yyyy-MM-dd"),
      endsAt: format(endsAt, "yyyy-MM-dd"),
    };
  }

  return {
    type,
    label: format(date, "MMMM yyyy", { locale: es }),
    shortLabel: "Mes actual",
    startsAt: format(monthStart, "yyyy-MM-dd"),
    endsAt: format(monthEnd, "yyyy-MM-dd"),
  };
}

function minDate(a: Date, b: Date) {
  return isBefore(a, b) ? a : b;
}

function maxDate(a: Date, b: Date) {
  return isAfter(a, b) ? a : b;
}

import { Link } from "react-router-dom";
import { ArrowRight, CalendarClock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import type { MonthlyForecast } from "@/types/fixedExpenses";

type FixedExpensesThisMonthProps = {
  forecast: MonthlyForecast;
};

export function FixedExpensesThisMonth({ forecast }: FixedExpensesThisMonthProps) {
  const pendingItems = forecast.fixedExpenseItems.filter((item) => item.status === "pending").slice(0, 3);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-normal text-primary">Gastos fijos</p>
          <h2 className="mt-1 text-lg font-bold tracking-normal text-foreground">{formatCurrency(forecast.pendingFixedExpenses)} pendientes</h2>
        </div>
        <CalendarClock className="h-5 w-5 text-primary" aria-hidden="true" />
      </div>

      <div className="mt-4 space-y-2">
        {pendingItems.length === 0 ? (
          <p className="rounded-2xl bg-emerald-50 px-3 py-3 text-sm font-semibold text-emerald-800">No hay pagos fijos pendientes este mes.</p>
        ) : (
          pendingItems.map((item) => (
            <div key={item.fixedExpense.id} className="flex items-center justify-between rounded-2xl bg-white/70 px-3 py-3">
              <div>
                <p className="text-sm font-bold text-foreground">{item.fixedExpense.name}</p>
                <p className="text-xs font-semibold text-muted-foreground">
                  Día {item.fixedExpense.paymentWindowStartDay}-{item.fixedExpense.paymentWindowEndDay}
                </p>
              </div>
              <p className="text-sm font-bold text-foreground">{formatCurrency(item.fixedExpense.amount)}</p>
            </div>
          ))
        )}
      </div>

      <Link to="/fixed-expenses" className="mt-4 flex items-center justify-between text-sm font-bold text-primary">
        Gestionar gastos fijos
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </Card>
  );
}

import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { MoneyFluxLogo } from "@/components/brand/MoneyFluxLogo";
import { Button } from "@/components/ui/button";
import { formatShortDate } from "@/lib/formatters";

type DashboardHeaderProps = {
  currentDate: Date;
};

export function DashboardHeader({ currentDate }: DashboardHeaderProps) {
  return (
    <section className="flex min-w-0 flex-col gap-3 rounded-[1.6rem] bg-white/68 p-4 shadow-soft md:flex-row md:items-center md:justify-between md:p-5">
      <div className="flex min-w-0 items-center gap-3">
        <MoneyFluxLogo size="lg" className="hidden sm:block" />
        <div className="min-w-0">
          <p className="text-sm font-black uppercase tracking-normal text-primary">{formatShortDate(currentDate)}</p>
          <h1 className="mt-1 text-2xl font-black tracking-normal text-foreground md:text-3xl">Financial Command Center</h1>
          <p className="mt-1 text-sm font-semibold leading-6 text-muted-foreground">Balance claro, decisiones simples.</p>
        </div>
      </div>

      <Button asChild size="lg" className="w-full shrink-0 md:w-auto">
        <Link to="/new">
          <Plus className="h-5 w-5" aria-hidden="true" />
          Nuevo movimiento
        </Link>
      </Button>
    </section>
  );
}

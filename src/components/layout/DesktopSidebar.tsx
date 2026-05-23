import { NavLink } from "react-router-dom";
import { CalendarClock, Grid2X2, History, Plus, Settings, Tags, Target } from "lucide-react";
import { MoneyFluxLogo } from "@/components/brand/MoneyFluxLogo";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: Grid2X2, end: true },
  { to: "/new", label: "Nuevo movimiento", icon: Plus },
  { to: "/history", label: "Historial", icon: History },
  { to: "/fixed-expenses", label: "Gastos fijos", icon: CalendarClock },
  { to: "/saving-milestones", label: "Metas", icon: Target },
  { to: "/categories", label: "Categorías", icon: Tags },
  { to: "/settings", label: "Ajustes", icon: Settings },
];

export function DesktopSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-white/80 bg-white/72 p-5 backdrop-blur-xl md:flex md:flex-col">
      <div className="flex items-center gap-3 px-2 py-2">
        <MoneyFluxLogo />
        <div>
          <p className="text-sm font-semibold text-foreground">Money Flux</p>
          <p className="text-xs font-medium text-muted-foreground">Control personal</p>
        </div>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-muted-foreground transition hover:bg-white hover:text-foreground",
                isActive && "bg-white text-primary shadow-soft",
                item.to === "/new" && "mb-2 bg-primary text-primary-foreground shadow-lift hover:bg-teal-700 hover:text-primary-foreground",
              )
            }
          >
            <item.icon className="h-5 w-5" aria-hidden="true" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="rounded-2xl border border-teal-100 bg-teal-50/85 p-4">
        <p className="text-sm font-semibold text-teal-900">Ritmo mensual</p>
        <p className="mt-1 text-xs leading-5 text-teal-700">Registra cada movimiento al momento para mantener claridad sin esfuerzo.</p>
      </div>
    </aside>
  );
}

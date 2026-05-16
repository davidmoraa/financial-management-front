import { NavLink } from "react-router-dom";
import { Grid2X2, History, Plus, Settings, Tags } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Inicio", icon: Grid2X2 },
  { to: "/history", label: "Historial", icon: History },
  { to: "/categories", label: "Categorías", icon: Tags },
  { to: "/settings", label: "Ajustes", icon: Settings },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/80 bg-white/88 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-16px_40px_-28px_rgba(8,47,73,0.45)] backdrop-blur md:hidden">
      <div className="relative mx-auto grid max-w-md grid-cols-5 items-end gap-1">
        {navItems.slice(0, 2).map((item) => (
          <NavItem key={item.to} {...item} />
        ))}

        <NavLink
          to="/new"
          aria-label="Nuevo movimiento"
          className={({ isActive }) =>
            cn(
              "group -mt-7 flex flex-col items-center gap-1 text-[11px] font-semibold text-primary",
              isActive && "text-teal-800",
            )
          }
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lift transition group-active:scale-95">
            <Plus className="h-7 w-7" aria-hidden="true" />
          </span>
          Nuevo
        </NavLink>

        {navItems.slice(2).map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </div>
    </nav>
  );
}

type NavItemProps = (typeof navItems)[number];

function NavItem({ to, label, icon: Icon }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        cn(
          "flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-semibold text-muted-foreground transition",
          isActive && "bg-teal-50 text-primary",
        )
      }
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      <span className="max-w-full truncate">{label}</span>
    </NavLink>
  );
}

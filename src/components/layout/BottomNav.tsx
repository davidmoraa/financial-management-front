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
    <nav className="fixed inset-x-3 bottom-3 z-40 md:hidden">
      <div className="relative mx-auto grid max-w-md grid-cols-5 items-end gap-1 rounded-[1.65rem] border border-white/85 bg-white/92 px-2 pb-[max(0.55rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_18px_60px_-28px_rgba(8,47,73,0.82)] ring-1 ring-teal-900/5 backdrop-blur-[26px] backdrop-saturate-150 supports-[backdrop-filter]:bg-white/90">
        {navItems.slice(0, 2).map((item) => (
          <NavItem key={item.to} {...item} />
        ))}

        <NavLink
          to="/new"
          aria-label="Nuevo movimiento"
          className={({ isActive }) =>
            cn(
              "group -mt-7 flex flex-col items-center gap-0.5 text-[11px] font-semibold text-primary",
              isActive && "text-teal-800",
            )
          }
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full border-[5px] border-white/95 bg-primary text-primary-foreground shadow-[0_16px_34px_-16px_rgba(7,89,79,0.85)] transition group-active:scale-95">
            <Plus className="h-6 w-6" aria-hidden="true" />
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
          "flex min-h-[48px] flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[11px] font-semibold text-muted-foreground transition",
          isActive && "bg-white/90 text-primary shadow-soft ring-1 ring-white/90",
        )
      }
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      <span className="max-w-full truncate">{label}</span>
    </NavLink>
  );
}

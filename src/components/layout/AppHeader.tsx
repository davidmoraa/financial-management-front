import { Link, useLocation } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MoneyFluxLogo } from "@/components/brand/MoneyFluxLogo";
import { SyncStatusBadge } from "@/components/sync/SyncStatusBadge";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: "Tu mes financiero",
    subtitle: "Balance claro, decisiones simples.",
  },
  "/new": {
    title: "Nuevo movimiento",
    subtitle: "Captura rápida y sin fricción.",
  },
  "/history": {
    title: "Historial",
    subtitle: "Revisa tus movimientos del mes.",
  },
  "/categories": {
    title: "Categorías",
    subtitle: "Tu mapa de ingresos y gastos.",
  },
  "/settings": {
    title: "Ajustes",
    subtitle: "Preferencias iniciales de la app.",
  },
};

export function AppHeader() {
  const location = useLocation();
  const copy = pageTitles[location.pathname] ?? pageTitles["/"];
  const showNewMovementAction = location.pathname !== "/" && location.pathname !== "/new";

  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-background/72 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <MoneyFluxLogo size="sm" className="md:hidden" />
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold tracking-normal text-foreground md:text-2xl">{copy.title}</h1>
            <p className="mt-1 truncate text-sm font-medium text-muted-foreground">{copy.subtitle}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <SyncStatusBadge className="hidden sm:inline-flex" />
          {showNewMovementAction && (
            <Button asChild className="hidden md:inline-flex" size="md">
              <Link to="/new">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Nuevo movimiento
              </Link>
            </Button>
          )}
        </div>
      </div>
      <div className="px-4 pb-3 sm:hidden">
        <SyncStatusBadge className="w-full justify-center" />
      </div>
    </header>
  );
}

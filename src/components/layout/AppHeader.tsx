import { Link, useLocation } from "react-router-dom";
import { Plus, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-background/72 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-soft md:hidden">
            <WalletCards className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold tracking-normal text-foreground md:text-2xl">{copy.title}</h1>
            <p className="mt-1 truncate text-sm font-medium text-muted-foreground">{copy.subtitle}</p>
          </div>
        </div>

        {location.pathname !== "/new" && (
          <Button asChild className="hidden md:inline-flex" size="md">
            <Link to="/new">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nuevo movimiento
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}

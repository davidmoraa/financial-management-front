import { Bell, CalendarClock, CircleDollarSign, DatabaseZap, LogOut, RefreshCw, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SyncStatusBadge } from "@/components/sync/SyncStatusBadge";
import { Button } from "@/components/ui/button";
import { syncPendingItems } from "@/lib/offline/syncEngine";
import { useAuthStore } from "@/stores/authStore";
import { useTransactionStore } from "@/stores/transactionStore";
import { formatCurrency } from "@/lib/formatters";

export function SettingsPage() {
  const monthlyBudget = useTransactionStore((state) => state.monthlyBudget);
  const pendingSyncCount = useTransactionStore((state) => state.pendingSyncCount);
  const isSyncing = useTransactionStore((state) => state.isSyncing);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    if (pendingSyncCount > 0 && !window.confirm("Tienes movimientos pendientes de sincronizar. ¿Cerrar sesión de todos modos?")) {
      return;
    }
    logout();
  };

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card className="p-5 lg:col-span-2">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-100 text-primary">
            <Wallet className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-normal text-foreground">Preferencias iniciales</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              La app guarda movimientos en IndexedDB para funcionar sin conexión y preparar la sincronización posterior.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <SettingRow icon={CircleDollarSign} label="Presupuesto mensual" value={formatCurrency(monthlyBudget)} />
          <SettingRow icon={CircleDollarSign} label="Moneda" value="MXN" />
          <SettingRow icon={Wallet} label="Sesión" value={isAuthenticated ? user?.email ?? "Activa" : "Sin sesión"} />
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-100 text-lime-700">
          <DatabaseZap className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-lg font-bold tracking-normal text-foreground">Persistencia</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Supabase y backend se conectarán después. Por ahora los datos financieros viven en IndexedDB, no en localStorage.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge tone="warning">Offline-first</Badge>
          <SyncStatusBadge />
        </div>
        <div className="mt-5 grid gap-2">
          <Button asChild variant="secondary">
            <Link to="/fixed-expenses">
              <CalendarClock className="h-4 w-4" aria-hidden="true" />
              Gastos fijos
            </Link>
          </Button>
          <Button variant="secondary" onClick={() => void syncPendingItems()} disabled={!isAuthenticated || isSyncing}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Sincronizar ahora
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Cerrar sesión
          </Button>
        </div>
      </Card>

      <Card className="p-5 lg:col-span-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <Bell className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-normal text-foreground">Avisos</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Aquí quedará espacio para recordatorios, alertas de presupuesto y ajustes reales cuando se conecte persistencia.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

type SettingRowProps = {
  icon: typeof CircleDollarSign;
  label: string;
  value: string;
};

function SettingRow({ icon: Icon, label, value }: SettingRowProps) {
  return (
    <div className="rounded-2xl border border-border bg-white/72 p-4">
      <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
      <p className="mt-3 text-sm font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold tracking-normal text-foreground">{value}</p>
    </div>
  );
}

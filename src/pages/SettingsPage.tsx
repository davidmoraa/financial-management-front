import { Apple, Bell, CalendarClock, Chrome, CircleDollarSign, CreditCard, DatabaseZap, Link2Off, LogOut, RefreshCw, Target, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { AppConfirmDialog } from "@/components/feedback/AppConfirmDialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SyncStatusBadge } from "@/components/sync/SyncStatusBadge";
import { Button } from "@/components/ui/button";
import { requestAppleIdToken } from "@/lib/oauth/browserProviders";
import { incomeCadenceLabels } from "@/lib/finance/incomeCadence";
import { startSupabaseGoogleOAuth } from "@/lib/oauth/supabaseGoogle";
import { syncPendingItems } from "@/lib/offline/syncEngine";
import { useAuthStore } from "@/stores/authStore";
import { useTransactionStore } from "@/stores/transactionStore";
import { formatCurrency } from "@/lib/formatters";

export function SettingsPage() {
  const monthlyBudget = useTransactionStore((state) => state.monthlyBudget);
  const pendingSyncCount = useTransactionStore((state) => state.pendingSyncCount);
  const isSyncing = useTransactionStore((state) => state.isSyncing);
  const refreshSyncCounts = useTransactionStore((state) => state.refreshSyncCounts);
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const linkedProviders = useAuthStore((state) => state.linkedProviders);
  const linkApple = useAuthStore((state) => state.linkApple);
  const unlinkProvider = useAuthStore((state) => state.unlinkProvider);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const [providerError, setProviderError] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    if (pendingSyncCount > 0) {
      setShowLogoutConfirm(true);
      return;
    }

    logout();
  };

  const hasGoogle = linkedProviders.some((account) => account.provider === "google");
  const hasApple = linkedProviders.some((account) => account.provider === "apple");
  const canUnlink = linkedProviders.length > 1;

  const handleLinkGoogle = async () => {
    setProviderError(null);
    try {
      await startSupabaseGoogleOAuth({ intent: "link_google", intendedPath: "/settings" });
    } catch {
      setProviderError("No se pudo vincular Google. Puede que ya esté vinculado a otra cuenta.");
    }
  };

  const handleLinkApple = async () => {
    setProviderError(null);
    try {
      const result = await requestAppleIdToken();
      await linkApple(result.idToken, { displayName: result.displayName });
    } catch {
      setProviderError("No se pudo vincular Apple. Puede que ya esté vinculado a otra cuenta.");
    }
  };

  const handleSyncNow = async () => {
    await syncPendingItems();
    await refreshSyncCounts();
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
          <SettingRow icon={CircleDollarSign} label="Presupuesto mensual" value={monthlyBudget > 0 ? formatCurrency(monthlyBudget) : "Sin configurar"} />
          <SettingRow
            icon={CircleDollarSign}
            label="Ingreso esperado"
            value={
              typeof profile?.expectedIncomeAmount === "number" && profile.incomeCadence
                ? `${formatCurrency(profile.expectedIncomeAmount)} ${incomeCadenceLabels[profile.incomeCadence].toLowerCase()}`
                : "Sin configurar"
            }
          />
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
          <Button asChild variant="secondary">
            <Link to="/credit-cards">
              <CreditCard className="h-4 w-4" aria-hidden="true" />
              Tarjetas de crédito
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/saving-milestones">
              <Target className="h-4 w-4" aria-hidden="true" />
              Metas de ahorro
            </Link>
          </Button>
          <Button variant="secondary" onClick={() => void handleSyncNow()} disabled={!isAuthenticated || isSyncing}>
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

      <Card className="p-5 lg:col-span-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <Wallet className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-normal text-foreground">Cuentas vinculadas</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Google y Apple pueden apuntar al mismo perfil. La identidad remota se valida siempre en la API.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <ProviderRow
            icon={Chrome}
            label="Google"
            connected={hasGoogle}
            canUnlink={canUnlink}
            onLink={() => void handleLinkGoogle()}
            onUnlink={() => void unlinkProvider("google").catch(() => setProviderError("No se pudo desvincular Google."))}
          />
          <ProviderRow
            icon={Apple}
            label="Apple"
            connected={hasApple}
            canUnlink={canUnlink}
            onLink={() => void handleLinkApple()}
            onUnlink={() => void unlinkProvider("apple").catch(() => setProviderError("No se pudo desvincular Apple."))}
          />
        </div>
        {!canUnlink && linkedProviders.length > 0 && (
          <p className="mt-3 text-sm font-semibold text-muted-foreground">No puedes desvincular el último método de acceso.</p>
        )}
        {providerError && <p className="mt-3 text-sm font-semibold text-red-600">{providerError}</p>}
      </Card>
      <AppConfirmDialog
        open={showLogoutConfirm}
        eyebrow="Pendientes de sincronizar"
        title="¿Cerrar sesión de todos modos?"
        description="Tienes movimientos pendientes de sincronizar. Si cierras sesión ahora, seguirán guardados en este dispositivo para sincronizarse más adelante."
        confirmLabel="Cerrar sesión"
        cancelLabel="Seguir aquí"
        tone="warning"
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          logout();
        }}
      />
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

function ProviderRow({
  icon: Icon,
  label,
  connected,
  canUnlink,
  onLink,
  onUnlink,
}: {
  icon: typeof Wallet;
  label: string;
  connected: boolean;
  canUnlink: boolean;
  onLink: () => void;
  onUnlink: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white/72 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
          <div>
            <p className="text-sm font-bold text-foreground">{label}</p>
            <p className="text-xs font-semibold text-muted-foreground">{connected ? "Conectado" : "No conectado"}</p>
          </div>
        </div>
        {connected ? (
          <Button size="sm" variant="outline" onClick={onUnlink} disabled={!canUnlink}>
            <Link2Off className="h-4 w-4" aria-hidden="true" />
            Desvincular
          </Button>
        ) : (
          <Button size="sm" variant="secondary" onClick={onLink}>
            Vincular
          </Button>
        )}
      </div>
    </div>
  );
}

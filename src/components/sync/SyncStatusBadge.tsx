import { AlertTriangle, CheckCircle2, CloudOff, RefreshCw } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useNetworkStore } from "@/stores/networkStore";
import { useTransactionStore } from "@/stores/transactionStore";
import { cn } from "@/lib/utils";

type SyncStatusBadgeProps = {
  className?: string;
};

export function SyncStatusBadge({ className }: SyncStatusBadgeProps) {
  const isOnline = useNetworkStore((state) => state.isOnline);
  const pendingSyncCount = useTransactionStore((state) => state.pendingSyncCount);
  const failedSyncCount = useTransactionStore((state) => state.failedSyncCount);
  const isSyncing = useTransactionStore((state) => state.isSyncing);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const state = getBadgeState({ failedSyncCount, isAuthenticated, isOnline, isSyncing, pendingSyncCount });
  const Icon = state.icon;

  return (
    <div
      className={cn(
        "inline-flex max-w-full items-center gap-2 rounded-full px-3 py-2 text-xs font-bold leading-none",
        state.className,
        className,
      )}
      aria-live="polite"
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate">{state.label}</span>
    </div>
  );
}

function getBadgeState({
  isOnline,
  isAuthenticated,
  isSyncing,
  pendingSyncCount,
  failedSyncCount,
}: {
  isOnline: boolean;
  isAuthenticated: boolean;
  isSyncing: boolean;
  pendingSyncCount: number;
  failedSyncCount: number;
}) {
  if (!isAuthenticated) {
    return {
      label: "Datos guardados solo en este dispositivo",
      icon: CloudOff,
      className: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
    };
  }

  if (isSyncing) {
    return {
      label: "Sincronizando...",
      icon: RefreshCw,
      className: "bg-lime-50 text-lime-800 ring-1 ring-lime-100",
    };
  }

  if (failedSyncCount > 0) {
    return {
      label: "Error de sincronización",
      icon: AlertTriangle,
      className: "bg-red-50 text-red-700 ring-1 ring-red-100",
    };
  }

  if (!isOnline) {
    return {
      label: `Sin conexión — ${pendingSyncCount} pendientes`,
      icon: CloudOff,
      className: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
    };
  }

  if (pendingSyncCount > 0) {
    return {
      label: `${pendingSyncCount} pendientes`,
      icon: RefreshCw,
      className: "bg-lime-50 text-lime-800 ring-1 ring-lime-100",
    };
  }

  return {
    label: "Todo sincronizado",
    icon: CheckCircle2,
    className: "bg-teal-50 text-teal-700 ring-1 ring-teal-100",
  };
}

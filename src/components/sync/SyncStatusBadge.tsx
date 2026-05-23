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
        "inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-black leading-none md:px-3 md:text-xs",
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
      label: "Datos locales",
      icon: CloudOff,
      className: "bg-slate-100/80 text-slate-700 ring-1 ring-slate-200",
    };
  }

  if (isSyncing) {
    return {
      label: "Sincronizando",
      icon: RefreshCw,
      className: "bg-lime-50/80 text-lime-800 ring-1 ring-lime-100",
    };
  }

  if (failedSyncCount > 0) {
    return {
      label: "Datos locales · se subirán después",
      icon: AlertTriangle,
      className: "bg-amber-50/85 text-amber-800 ring-1 ring-amber-100",
    };
  }

  if (!isOnline) {
    return {
      label: pendingSyncCount > 0
        ? `Offline · ${pendingSyncCount} guardados`
        : "Offline · guardando local",
      icon: CloudOff,
      className: "bg-amber-50/85 text-amber-800 ring-1 ring-amber-100",
    };
  }

  if (pendingSyncCount > 0) {
    return {
      label: `Sync pendiente · ${pendingSyncCount} cambios`,
      icon: RefreshCw,
      className: "bg-lime-50/80 text-lime-800 ring-1 ring-lime-100",
    };
  }

  return {
    label: "Respaldado",
    icon: CheckCircle2,
    className: "bg-teal-50/80 text-teal-700 ring-1 ring-teal-100",
  };
}

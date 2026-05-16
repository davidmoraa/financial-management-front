import { AlertTriangle, CheckCircle2, CloudOff, RefreshCw } from "lucide-react";
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

  const state = getBadgeState({ isOnline, pendingSyncCount, failedSyncCount });
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
  pendingSyncCount,
  failedSyncCount,
}: {
  isOnline: boolean;
  pendingSyncCount: number;
  failedSyncCount: number;
}) {
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
      label: `Pendiente de sincronizar: ${pendingSyncCount}`,
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

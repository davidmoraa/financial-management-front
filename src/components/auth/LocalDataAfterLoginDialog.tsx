import { useEffect, useState } from "react";
import { DatabaseZap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AppConfirmDialog } from "@/components/feedback/AppConfirmDialog";
import { clearLocalFinancialRecords, financeDb } from "@/lib/offline/db";
import { syncPendingItems } from "@/lib/offline/syncEngine";
import { getPendingCount } from "@/lib/offline/syncQueueRepository";
import { useAuthStore } from "@/stores/authStore";
import { useFixedExpenseStore } from "@/stores/fixedExpenseStore";
import { useTransactionStore } from "@/stores/transactionStore";

export const LOCAL_DATA_DIALOG_DISMISSED_KEY = "financial_management_local_data_dialog_dismissed";
export const LOCAL_DATA_DIALOG_DISMISSED_EVENT = "financial-management:local-data-dialog-dismissed";

export function LocalDataAfterLoginDialog() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isVisible, setIsVisible] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || window.sessionStorage.getItem(LOCAL_DATA_DIALOG_DISMISSED_KEY) === "true") {
      return;
    }

    let mounted = true;
    void hasLocalData().then((value) => {
      if (mounted && value) {
        setIsVisible(true);
      }
    });

    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  if (!isVisible) {
    return null;
  }

  const close = () => {
    window.sessionStorage.setItem(LOCAL_DATA_DIALOG_DISMISSED_KEY, "true");
    window.dispatchEvent(new CustomEvent(LOCAL_DATA_DIALOG_DISMISSED_EVENT));
    setIsVisible(false);
  };

  const uploadToAccount = async () => {
    setIsSyncing(true);
    await syncPendingItems();
    setIsSyncing(false);
    close();
  };

  const discardLocalData = async () => {
    setIsDiscarding(true);
    await clearLocalFinancialRecords();
    useTransactionStore.setState({
      transactions: [],
      pendingSyncCount: 0,
      failedSyncCount: 0,
    });
    useFixedExpenseStore.setState({
      fixedExpenses: [],
      occurrences: [],
    });
    setIsDiscarding(false);
    setShowDiscardConfirm(false);
    close();
  };

  return (
    <>
      {!showDiscardConfirm && (
      <div className="fixed inset-0 z-50 flex items-end bg-slate-950/55 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6 backdrop-blur-[3px] sm:items-center sm:justify-center">
        <Card
          role="dialog"
          aria-modal="true"
          aria-labelledby="local-data-dialog-title"
          className="w-full max-w-[26rem] overflow-hidden rounded-[1.35rem] border border-white/95 bg-white p-0 shadow-[0_26px_80px_-32px_rgba(2,44,34,0.58)]"
        >
          <div className="h-1.5 bg-gradient-to-r from-teal-600 via-emerald-400 to-lime-300" />
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                <DatabaseZap className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-teal-700">Datos locales</p>
                <h2 id="local-data-dialog-title" className="mt-1 text-lg font-bold leading-6 text-slate-950">
                  Encontramos datos guardados en este dispositivo.
                </h2>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                  Puedes subirlos a tu cuenta ahora o mantenerlos locales por el momento. No se borrará nada sin
                  confirmación.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-teal-100 bg-teal-50/80 px-4 py-3">
              <p className="text-sm font-semibold leading-5 text-teal-950">
                Tus movimientos seguirán disponibles en este dispositivo mientras decides qué hacer.
              </p>
            </div>

            <div className="mt-5 grid gap-2.5">
              <Button className="h-12 rounded-2xl text-sm font-bold" onClick={() => void uploadToAccount()} disabled={isSyncing || isDiscarding}>
                {isSyncing ? "Subiendo datos..." : "Subirlos a mi cuenta"}
              </Button>
              <Button
                className="h-12 rounded-2xl border-slate-200 bg-white text-sm font-bold text-slate-800 hover:bg-slate-50"
                variant="outline"
                onClick={close}
                disabled={isSyncing || isDiscarding}
              >
                Mantenerlos en este dispositivo
              </Button>
              <Button
                className="h-11 rounded-2xl text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-700"
                variant="ghost"
                disabled={isSyncing || isDiscarding}
                onClick={() => setShowDiscardConfirm(true)}
              >
                Descartar datos locales
              </Button>
            </div>
          </div>
        </Card>
      </div>
      )}
      <AppConfirmDialog
        open={showDiscardConfirm}
        eyebrow="Advertencia"
        title="¿Descartar datos locales?"
        description="Si aceptas, se borrarán todos los registros locales de este dispositivo, incluyendo movimientos, gastos fijos y pendientes de sincronizar."
        confirmLabel="Sí, borrar registros locales"
        cancelLabel="Volver"
        isConfirming={isDiscarding}
        onCancel={() => setShowDiscardConfirm(false)}
        onConfirm={discardLocalData}
      />
    </>
  );
}

export async function hasLocalData() {
  const [transactions, fixedExpenses, occurrences, pendingItems] = await Promise.all([
    financeDb.transactions.filter((transaction) => !transaction.deletedAt).count(),
    financeDb.fixedExpenses.filter((fixedExpense) => !fixedExpense.deletedAt).count(),
    financeDb.fixedExpenseOccurrences.filter((occurrence) => !occurrence.deletedAt).count(),
    getPendingCount(),
  ]);

  return transactions + fixedExpenses + occurrences + pendingItems > 0;
}

import { useEffect, useState } from "react";
import { DatabaseZap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { financeDb } from "@/lib/offline/db";
import { syncPendingItems } from "@/lib/offline/syncEngine";
import { getPendingCount } from "@/lib/offline/syncQueueRepository";
import { useAuthStore } from "@/stores/authStore";

const DISMISSED_KEY = "financial_management_local_data_dialog_dismissed";

export function LocalDataAfterLoginDialog() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isVisible, setIsVisible] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || window.sessionStorage.getItem(DISMISSED_KEY) === "true") {
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
    window.sessionStorage.setItem(DISMISSED_KEY, "true");
    setIsVisible(false);
  };

  const uploadToAccount = async () => {
    setIsSyncing(true);
    await syncPendingItems();
    setIsSyncing(false);
    close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/35 p-3 backdrop-blur-sm sm:items-center sm:justify-center">
      <Card className="w-full max-w-lg p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-100 text-primary">
            <DatabaseZap className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Encontramos datos guardados en este dispositivo.</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Puedes subirlos a tu cuenta ahora o mantenerlos locales por el momento. No se borrará nada sin confirmación.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-2">
          <Button onClick={() => void uploadToAccount()} disabled={isSyncing}>
            Subirlos a mi cuenta
          </Button>
          <Button variant="outline" onClick={close}>
            Mantenerlos solo en este dispositivo por ahora
          </Button>
          <Button variant="ghost" disabled>
            Descartar datos locales
          </Button>
        </div>
      </Card>
    </div>
  );
}

async function hasLocalData() {
  const [transactions, fixedExpenses, pendingItems] = await Promise.all([
    financeDb.transactions.filter((transaction) => !transaction.deletedAt).count(),
    financeDb.fixedExpenses.filter((fixedExpense) => !fixedExpense.deletedAt).count(),
    getPendingCount(),
  ]);

  return transactions + fixedExpenses + pendingItems > 0;
}

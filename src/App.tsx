import { AppRouter } from "@/app/router";
import { LocalDataAfterLoginDialog } from "@/components/auth/LocalDataAfterLoginDialog";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

export default function App() {
  useOfflineSync();
  useEffect(() => {
    void useAuthStore.getState().loadSession();
  }, []);

  return (
    <>
      <AppRouter />
      <LocalDataAfterLoginDialog />
    </>
  );
}

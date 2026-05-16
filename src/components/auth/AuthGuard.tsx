import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import type { PropsWithChildren } from "react";
import { useAuthStore } from "@/stores/authStore";

export function AuthGuard({ children }: PropsWithChildren) {
  const location = useLocation();
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const loadSession = useAuthStore((state) => state.loadSession);

  useEffect(() => {
    if (token && !isAuthenticated && !isAuthLoading) {
      void loadSession();
    }
  }, [isAuthenticated, isAuthLoading, loadSession, token]);

  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-sm font-semibold text-muted-foreground">
        Validando sesión...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

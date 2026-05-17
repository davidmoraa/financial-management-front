import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MoneyFluxLogo } from "@/components/brand/MoneyFluxLogo";
import { Button } from "@/components/ui/button";
import { getSupabaseClient, supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const loginWithSupabaseGoogle = useAuthStore((state) => state.loginWithSupabaseGoogle);
  const linkSupabaseGoogle = useAuthStore((state) => state.linkSupabaseGoogle);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let completed = false;
    const client = supabase ?? getSupabaseClient();
    if (!client) {
      navigate("/login", { replace: true });
      return;
    }

    const finalize = async () => {
      if (completed) {
        return;
      }

      try {
        const { data } = await client.auth.getSession();
        const session = data.session ?? null;
        if (!session) {
          return;
        }
        completed = true;

        const intended = window.sessionStorage.getItem("intendedPath");
        const intent = window.sessionStorage.getItem("oauthIntent");
        window.sessionStorage.removeItem("intendedPath");
        window.sessionStorage.removeItem("oauthIntent");

        if (intent === "link_google") {
          await linkSupabaseGoogle(session.access_token);
        } else {
          await loginWithSupabaseGoogle(session.access_token);
        }

        if (!cancelled) {
          navigate(intended || "/", { replace: true });
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : "No se pudo completar el acceso.");
        }
      }
    };

    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      if (session) {
        void finalize();
      }
    });

    void finalize();

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, [linkSupabaseGoogle, loginWithSupabaseGoogle, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      {errorMessage ? (
        <div className="w-full max-w-sm rounded-2xl border border-border bg-white p-5 text-center shadow-soft">
          <MoneyFluxLogo size="lg" className="mx-auto mb-4" />
          <h1 className="text-lg font-bold text-foreground">No se pudo completar el acceso</h1>
          <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">{errorMessage}</p>
          <Button asChild className="mt-5 w-full">
            <Link to="/login">Volver a iniciar sesión</Link>
          </Button>
        </div>
      ) : (
        <div className="relative" aria-label="Procesando acceso">
          <MoneyFluxLogo size="lg" />
          <span className="absolute -inset-2 animate-spin rounded-[1.7rem] border-2 border-transparent border-b-primary" />
        </div>
      )}
    </div>
  );
}

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSupabaseClient, supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/authStore";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const loginWithSupabaseGoogle = useAuthStore((state) => state.loginWithSupabaseGoogle);
  const linkSupabaseGoogle = useAuthStore((state) => state.linkSupabaseGoogle);

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
      <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" aria-label="Procesando acceso" />
    </div>
  );
}

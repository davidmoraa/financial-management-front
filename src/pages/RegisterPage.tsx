import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { AuthPageShell, SocialAuthPanel } from "@/pages/LoginPage";
import { requestAppleIdToken } from "@/lib/oauth/browserProviders";
import { startSupabaseGoogleOAuth } from "@/lib/oauth/supabaseGoogle";
import { useAuthStore } from "@/stores/authStore";

export function RegisterPage() {
  const navigate = useNavigate();
  const loginWithApple = useAuthStore((state) => state.loginWithApple);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const [providerError, setProviderError] = useState<string | null>(null);

  const onSocialLogin = async (provider: "google" | "apple") => {
    setProviderError(null);

    try {
      if (provider === "google") {
        await startSupabaseGoogleOAuth({ intent: "login_google", intendedPath: "/" });
        return;
      }

      const result = await requestAppleIdToken();
      await loginWithApple(result.idToken, { displayName: result.displayName });
      navigate("/", { replace: true });
    } catch {
      setProviderError("No pudimos crear tu acceso. Intenta de nuevo con Google o Apple.");
    }
  };

  return (
    <AuthPageShell
      title="Empieza con claridad desde el primer registro."
      subtitle="Crea tu acceso con Google o Apple. Money Flux guarda tus movimientos offline y los respalda cuando hay conexión."
    >
      <SocialAuthPanel
        disabled={isAuthLoading}
        error={providerError}
        onGoogle={() => void onSocialLogin("google")}
        onApple={() => void onSocialLogin("apple")}
        footerLabel="¿Ya tienes cuenta?"
        footerActionLabel="Entrar con Google o Apple"
        footerTo="/login"
      />
    </AuthPageShell>
  );
}

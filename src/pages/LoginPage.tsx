import { Link, useLocation, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useState } from "react";
import { Apple, Chrome, Cloud, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MoneyFluxLogo } from "@/components/brand/MoneyFluxLogo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requestAppleIdToken } from "@/lib/oauth/browserProviders";
import { startSupabaseGoogleOAuth } from "@/lib/oauth/supabaseGoogle";
import { useAuthStore } from "@/stores/authStore";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginWithApple = useAuthStore((state) => state.loginWithApple);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const [providerError, setProviderError] = useState<string | null>(null);
  const intendedPath = (location.state as { from?: string } | null)?.from ?? "/";

  const onSocialLogin = async (provider: "google" | "apple") => {
    setProviderError(null);

    try {
      if (provider === "google") {
        await startSupabaseGoogleOAuth({
          intent: "login_google",
          intendedPath,
        });
        return;
      }

      const result = await requestAppleIdToken();
      await loginWithApple(result.idToken, { displayName: result.displayName });
      navigate(intendedPath, { replace: true });
    } catch {
      setProviderError("No pudimos completar el acceso. Intenta de nuevo con Google o Apple.");
    }
  };

  return (
    <AuthPageShell
      title="Tu dinero, con menos fricción."
      subtitle="Entra con Google o Apple para mantener tu lectura financiera respaldada y lista en todos tus dispositivos."
    >
      <SocialAuthPanel
        disabled={isAuthLoading}
        error={providerError}
        onGoogle={() => void onSocialLogin("google")}
        onApple={() => void onSocialLogin("apple")}
        footerLabel="¿Primera vez en Money Flux?"
        footerActionLabel="Crea tu cuenta con Google o Apple"
        footerTo="/register"
      />
    </AuthPageShell>
  );
}

export function SocialAuthPanel({
  disabled,
  error,
  footerActionLabel,
  footerLabel,
  footerTo,
  onApple,
  onGoogle,
}: {
  disabled?: boolean;
  error?: string | null;
  footerActionLabel: string;
  footerLabel: string;
  footerTo: string;
  onGoogle: () => void;
  onApple: () => void;
}) {
  return (
    <div className="space-y-5">
      <OAuthButtons disabled={disabled} onGoogle={onGoogle} onApple={onApple} />

      {error && (
        <p className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold leading-6 text-amber-800">
          {error}
        </p>
      )}

      <div className="grid gap-2 rounded-[1.35rem] border border-teal-100 bg-teal-50/70 p-3">
        <TrustRow icon={LockKeyhole} text="Tu sesión se valida en la API de Money Flux." />
        <TrustRow icon={Cloud} text="Tus registros offline se respaldan cuando vuelve la conexión." />
        <TrustRow icon={ShieldCheck} text="No usamos email como identidad principal." />
      </div>

      <p className="text-center text-sm font-semibold leading-6 text-muted-foreground">
        {footerLabel}{" "}
        <Link className="font-black text-primary underline-offset-4 hover:underline" to={footerTo}>
          {footerActionLabel}
        </Link>
      </p>
    </div>
  );
}

export function OAuthButtons({
  disabled,
  onGoogle,
  onApple,
}: {
  disabled?: boolean;
  onGoogle: () => void;
  onApple: () => void;
}) {
  return (
    <div className="grid gap-3">
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="h-auto min-h-[4rem] w-full justify-start rounded-[1.35rem] border-teal-100 bg-white/88 px-4 py-3 text-left shadow-soft hover:bg-teal-50"
        disabled={disabled}
        onClick={onGoogle}
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-primary">
          <Chrome className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-black text-foreground">Continuar con Google</span>
          <span className="mt-0.5 block text-xs font-semibold text-muted-foreground">Acceso rápido y respaldo seguro.</span>
        </span>
      </Button>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="h-auto min-h-[4rem] w-full justify-start rounded-[1.35rem] border-slate-200 bg-slate-950 px-4 py-3 text-left text-white shadow-lift hover:bg-slate-900"
        disabled={disabled}
        onClick={onApple}
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
          <Apple className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-black text-white">Continuar con Apple</span>
          <span className="mt-0.5 block text-xs font-semibold text-white/70">Privado, simple y sin contraseña.</span>
        </span>
      </Button>
    </div>
  );
}

export function AuthPageShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_0%,rgba(20,184,166,0.2),transparent_36%),linear-gradient(180deg,#f8fffd_0%,#eef9f6_100%)] px-4 py-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-teal-100/55 to-transparent" aria-hidden="true" />
      <Card className="relative w-full max-w-md overflow-hidden rounded-[2rem] border-teal-100 bg-white/88 p-6 shadow-[0_30px_90px_-50px_rgba(15,82,78,0.9)] md:p-7">
        <div className="mb-6 text-center">
          <MoneyFluxLogo size="xl" className="mx-auto" />
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-lime-50 px-3 py-1 text-xs font-black uppercase tracking-normal text-lime-800 ring-1 ring-lime-100">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Money Flux
          </p>
          <h1 className="mt-4 text-3xl font-black leading-tight tracking-normal text-foreground">{title}</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm font-semibold leading-6 text-muted-foreground">{subtitle}</p>
        </div>
        {children}
        <p className="mt-6 text-center text-xs font-medium leading-5 text-muted-foreground">
          Al continuar aceptas los{" "}
          <Link className="font-bold text-primary underline-offset-4 hover:underline" to="/terms-of-service">
            terminos
          </Link>{" "}
          y la{" "}
          <Link className="font-bold text-primary underline-offset-4 hover:underline" to="/privacy-policy">
            politica de privacidad
          </Link>{" "}
          de Money Flux.
        </p>
      </Card>
    </main>
  );
}

function TrustRow({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="flex items-start gap-2 text-xs font-bold leading-5 text-teal-900">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
      <span>{text}</span>
    </div>
  );
}

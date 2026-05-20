import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { Apple, Chrome, LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MoneyFluxLogo } from "@/components/brand/MoneyFluxLogo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestAppleIdToken } from "@/lib/oauth/browserProviders";
import { startSupabaseGoogleOAuth } from "@/lib/oauth/supabaseGoogle";
import { useAuthStore } from "@/stores/authStore";

const loginSchema = z.object({
  email: z.string().email("Ingresa un email válido."),
  password: z.string().min(1, "Ingresa tu contraseña."),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const loginWithApple = useAuthStore((state) => state.loginWithApple);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginValues) => {
    try {
      await login(values);
      navigate((location.state as { from?: string } | null)?.from ?? "/", { replace: true });
    } catch {
      setError("root", { message: "No se pudo iniciar sesión con esos datos." });
    }
  };

  const onSocialLogin = async (provider: "google" | "apple") => {
    try {
      if (provider === "google") {
        await startSupabaseGoogleOAuth({
          intent: "login_google",
          intendedPath: (location.state as { from?: string } | null)?.from ?? "/",
        });
        return;
      } else {
        const result = await requestAppleIdToken();
        await loginWithApple(result.idToken, { displayName: result.displayName });
      }
      navigate((location.state as { from?: string } | null)?.from ?? "/", { replace: true });
    } catch {
      setError("root", { message: "No se pudo iniciar sesión con ese proveedor." });
    }
  };

  return (
    <AuthPageShell title="Inicia sesión" subtitle="Sincroniza tus movimientos entre dispositivos.">
      <div className="space-y-4">
        <OAuthButtons disabled={isAuthLoading} onGoogle={() => void onSocialLogin("google")} onApple={() => void onSocialLogin("apple")} />
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-bold uppercase tracking-normal text-muted-foreground">Email</span>
          <div className="h-px flex-1 bg-border" />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
        <Field label="Email" error={errors.email?.message}>
          <Input type="email" autoComplete="email" {...register("email")} />
        </Field>
        <Field label="Contraseña" error={errors.password?.message}>
          <Input type="password" autoComplete="current-password" {...register("password")} />
        </Field>
        {errors.root && <p className="text-sm font-semibold text-red-600">{errors.root.message}</p>}
        <Button type="submit" className="w-full" size="lg" disabled={isAuthLoading}>
          <LogIn className="h-5 w-5" aria-hidden="true" />
          Entrar
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          ¿No tienes cuenta? <Link className="font-bold text-primary" to="/register">Crear cuenta</Link>
        </p>
      </form>
    </AuthPageShell>
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
    <div className="grid gap-2">
      <Button type="button" variant="outline" size="lg" className="w-full justify-center" disabled={disabled} onClick={onGoogle}>
        <Chrome className="h-5 w-5" aria-hidden="true" />
        Continuar con Google
      </Button>
      <Button type="button" variant="outline" size="lg" className="w-full justify-center" disabled={disabled} onClick={onApple}>
        <Apple className="h-5 w-5" aria-hidden="true" />
        Continuar con Apple
      </Button>
    </div>
  );
}

export function AuthPageShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md p-6">
        <div className="mb-6 text-center">
          <MoneyFluxLogo size="xl" className="mx-auto" />
          <p className="mt-4 text-sm font-bold uppercase tracking-[0.16em] text-primary">Money Flux</p>
          <h1 className="mt-2 text-2xl font-bold tracking-normal text-foreground">{title}</h1>
          <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">{subtitle}</p>
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

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
    </div>
  );
}

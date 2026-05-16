import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AuthPageShell, OAuthButtons } from "@/pages/LoginPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestAppleIdToken, requestGoogleIdToken } from "@/lib/oauth/browserProviders";
import { useAuthStore } from "@/stores/authStore";

const registerSchema = z.object({
  displayName: z.string().max(80).optional(),
  email: z.string().email("Ingresa un email válido."),
  password: z.string().min(8, "Usa al menos 8 caracteres."),
});

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const registerAccount = useAuthStore((state) => state.register);
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  const loginWithApple = useAuthStore((state) => state.loginWithApple);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (values: RegisterValues) => {
    try {
      await registerAccount(values);
      navigate("/", { replace: true });
    } catch {
      setError("root", { message: "No se pudo crear la cuenta." });
    }
  };

  const onSocialLogin = async (provider: "google" | "apple") => {
    try {
      if (provider === "google") {
        await loginWithGoogle(await requestGoogleIdToken());
      } else {
        const result = await requestAppleIdToken();
        await loginWithApple(result.idToken, { displayName: result.displayName });
      }
      navigate("/", { replace: true });
    } catch {
      setError("root", { message: "No se pudo continuar con ese proveedor." });
    }
  };

  return (
    <AuthPageShell title="Crea tu cuenta" subtitle="Tus datos seguirán funcionando offline en este dispositivo.">
      <div className="space-y-4">
        <OAuthButtons disabled={isAuthLoading} onGoogle={() => void onSocialLogin("google")} onApple={() => void onSocialLogin("apple")} />
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-bold uppercase tracking-normal text-muted-foreground">Email opcional</span>
          <div className="h-px flex-1 bg-border" />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
        <Field label="Nombre" error={errors.displayName?.message}>
          <Input autoComplete="name" {...register("displayName")} />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <Input type="email" autoComplete="email" {...register("email")} />
        </Field>
        <Field label="Contraseña" error={errors.password?.message}>
          <Input type="password" autoComplete="new-password" {...register("password")} />
        </Field>
        {errors.root && <p className="text-sm font-semibold text-red-600">{errors.root.message}</p>}
        <Button type="submit" className="w-full" size="lg" disabled={isAuthLoading}>
          <UserPlus className="h-5 w-5" aria-hidden="true" />
          Crear cuenta
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta? <Link className="font-bold text-primary" to="/login">Entrar</Link>
        </p>
      </form>
    </AuthPageShell>
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

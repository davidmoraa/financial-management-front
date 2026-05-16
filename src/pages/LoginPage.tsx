import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { LogIn, WalletCards } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  return (
    <AuthPageShell title="Inicia sesión" subtitle="Sincroniza tus movimientos entre dispositivos.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

export function AuthPageShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md p-6">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lift">
            <WalletCards className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-normal text-foreground">{title}</h1>
          <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">{subtitle}</p>
        </div>
        {children}
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

import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { ArrowLeft, Database, ShieldCheck } from "lucide-react";
import { MoneyFluxLogo } from "@/components/brand/MoneyFluxLogo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const sections = [
  {
    title: "Informacion que recopilamos",
    body:
      "Podemos recopilar tu nombre, correo electronico, foto de perfil, proveedor de acceso, identificador del proveedor, configuracion de perfil y datos financieros que registres dentro de la app, como movimientos, gastos fijos, categorias, metodos de pago, presupuesto e informacion de sincronizacion.",
  },
  {
    title: "Como usamos tu informacion",
    body:
      "Usamos esta informacion para autenticar tu cuenta, mantener tus datos ligados a tu perfil, sincronizar dispositivos, calcular balances, generar estimaciones de presupuesto, mostrar advertencias utiles y operar la experiencia offline-first de Money Flux.",
  },
  {
    title: "Autenticacion con Google",
    body:
      "Cuando eliges continuar con Google, Money Flux usa el flujo OAuth/OpenID Connect para validar tu identidad. No usamos tu correo como identidad primaria: la cuenta se liga al identificador verificado del proveedor. La API valida el token antes de emitir una sesion interna de Money Flux.",
  },
  {
    title: "Datos locales y modo offline",
    body:
      "La app puede guardar datos financieros en IndexedDB del navegador para permitir captura offline y sincronizacion posterior. No usamos localStorage para guardar movimientos financieros; puede usarse solo para datos pequenos como sesion o preferencias necesarias para operar la app.",
  },
  {
    title: "Servicios de terceros",
    body:
      "Money Flux puede apoyarse en proveedores externos para autenticacion, infraestructura, base de datos, hosting y monitoreo operativo. Estos servicios procesan informacion solo en la medida necesaria para prestar la funcionalidad de la plataforma.",
  },
  {
    title: "Seguridad y conservacion",
    body:
      "Aplicamos medidas razonables para proteger tu informacion contra acceso no autorizado, perdida o uso indebido. Conservamos datos mientras tu cuenta este activa o mientras sean necesarios para operar el servicio, resolver incidencias o cumplir obligaciones aplicables.",
  },
  {
    title: "Tus opciones",
    body:
      "Puedes actualizar tus datos, solicitar eliminacion de informacion personal cuando aplique o pedir apoyo sobre privacidad mediante los canales oficiales del proyecto. Tambien puedes mantener ciertos datos solo en este dispositivo si decides no sincronizarlos.",
  },
  {
    title: "Cambios a esta politica",
    body:
      "Podemos actualizar esta politica para reflejar cambios en la operacion del servicio, integraciones o requisitos legales. La version vigente sera siempre la publicada en esta pagina.",
  },
];

export function PrivacyPolicyPage() {
  return (
    <LegalPageShell
      eyebrow="Privacidad"
      title="Politica de privacidad"
      description="Esta politica explica como Money Flux recopila, usa y protege la informacion relacionada con tu cuenta, tus movimientos financieros y la sincronizacion offline-first."
      icon={<ShieldCheck className="h-5 w-5" aria-hidden="true" />}
    >
      {sections.map((section) => (
        <section key={section.title} className="rounded-2xl border border-teal-100 bg-white/74 p-4 shadow-sm">
          <h2 className="text-base font-bold text-foreground">{section.title}</h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">{section.body}</p>
        </section>
      ))}

      <div className="rounded-2xl border border-lime-200 bg-lime-50/80 p-4 text-sm leading-7 text-teal-950">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 rounded-xl bg-white p-2 text-primary shadow-sm">
            <Database className="h-4 w-4" aria-hidden="true" />
          </span>
          <p>
            Money Flux esta pensado para finanzas personales. La informacion que registres debe tratarse como sensible y solo debe sincronizarse en dispositivos de confianza.
          </p>
        </div>
      </div>
    </LegalPageShell>
  );
}

function LegalPageShell({
  eyebrow,
  title,
  description,
  icon,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-3xl">
        <Link className="inline-flex items-center gap-2 text-sm font-bold text-primary" to="/login">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver al acceso
        </Link>

        <Card className="mt-5 overflow-hidden p-0">
          <div className="border-b border-teal-100 bg-gradient-to-br from-white via-teal-50/80 to-lime-50/70 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <MoneyFluxLogo size="lg" />
              <div>
                <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
                  <span className="rounded-full bg-white p-1 text-primary shadow-sm">{icon}</span>
                  {eyebrow}
                </p>
                <h1 className="mt-3 text-3xl font-black tracking-normal text-foreground sm:text-4xl">{title}</h1>
                <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-muted-foreground sm:text-base">{description}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-5 sm:p-8">{children}</div>

          <div className="flex flex-col gap-3 border-t border-teal-100 bg-white/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Ultima actualizacion: 20 de mayo de 2026</p>
            <Button asChild variant="outline" size="sm">
              <Link to="/terms-of-service">Ver terminos</Link>
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}

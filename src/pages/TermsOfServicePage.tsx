import { Link } from "react-router-dom";
import { ArrowLeft, FileText, ShieldAlert } from "lucide-react";
import { MoneyFluxLogo } from "@/components/brand/MoneyFluxLogo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const sections = [
  {
    title: "Uso de la app",
    body:
      "Al usar Money Flux aceptas utilizar la app para fines personales y de forma licita. No debes intentar afectar la disponibilidad del servicio, evadir controles de acceso o usar la plataforma para actividades fraudulentas.",
  },
  {
    title: "Cuenta y acceso",
    body:
      "Eres responsable de mantener el control de tus dispositivos y sesiones. El acceso con Google o Apple se valida desde el backend antes de emitir una sesion interna de Money Flux.",
  },
  {
    title: "Datos financieros",
    body:
      "Los movimientos, ingresos, gastos, gastos fijos, presupuestos y categorias que registres dependen de la informacion que captures. Money Flux ayuda a organizar y estimar, pero no sustituye estados de cuenta, contabilidad profesional ni asesoria financiera.",
  },
  {
    title: "Modo offline y sincronizacion",
    body:
      "La app puede funcionar sin conexion guardando datos localmente en tu dispositivo. Cuando vuelva la conexion, intentara sincronizar operaciones pendientes. Si ocurre un conflicto o falla de red, tus datos locales no se eliminan automaticamente.",
  },
  {
    title: "Disponibilidad",
    body:
      "Hacemos esfuerzos razonables para mantener el servicio disponible y correcto, pero pueden existir interrupciones, errores, retrasos de sincronizacion o mantenimiento. El uso de la app ocurre bajo tu propia responsabilidad dentro de los limites permitidos por la ley.",
  },
  {
    title: "Propiedad y contenido",
    body:
      "El nombre, identidad visual, interfaz, codigo y contenido de Money Flux pertenecen a sus titulares correspondientes. No se permite copiar, redistribuir o explotar estos elementos sin autorizacion.",
  },
  {
    title: "Cambios a los terminos",
    body:
      "Podemos modificar estos terminos cuando cambie la operacion del servicio, las integraciones o los requisitos legales. La version vigente sera la publicada en esta pagina.",
  },
];

export function TermsOfServicePage() {
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
                  <span className="rounded-full bg-white p-1 text-primary shadow-sm">
                    <FileText className="h-5 w-5" aria-hidden="true" />
                  </span>
                  Condiciones
                </p>
                <h1 className="mt-3 text-3xl font-black tracking-normal text-foreground sm:text-4xl">Terminos de servicio</h1>
                <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-muted-foreground sm:text-base">
                  Estos terminos regulan el uso de Money Flux, incluyendo acceso a cuenta, captura offline, sincronizacion, visualizacion de presupuesto y herramientas de finanzas personales.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-5 sm:p-8">
            {sections.map((section) => (
              <section key={section.title} className="rounded-2xl border border-teal-100 bg-white/74 p-4 shadow-sm">
                <h2 className="text-base font-bold text-foreground">{section.title}</h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{section.body}</p>
              </section>
            ))}

            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm leading-7 text-amber-950">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 rounded-xl bg-white p-2 text-amber-700 shadow-sm">
                  <ShieldAlert className="h-4 w-4" aria-hidden="true" />
                </span>
                <p>
                  Money Flux no ofrece asesoria financiera, fiscal, legal ni contable. Las estimaciones y advertencias son referencias para ayudarte a tomar mejores decisiones personales.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-teal-100 bg-white/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Ultima actualizacion: 20 de mayo de 2026</p>
            <Button asChild variant="outline" size="sm">
              <Link to="/privacy-policy">Ver privacidad</Link>
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}

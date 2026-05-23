import { useMemo, useState } from "react";
import { CreditCard, Loader2, Pause, Sparkles, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { simulateProjection } from "@/services/projectionsApi";
import { formatCurrency, formatTransactionDate } from "@/lib/formatters";
import type { DashboardSummary } from "@/types/dashboard";
import type { ProjectionSimulation, ProjectionScenario } from "@/types/projections";

type ProjectionSimulatorCardProps = {
  currentDate: Date;
  summary: DashboardSummary;
};

type ScenarioOption = {
  label: string;
  description: string;
  scenario: ProjectionScenario;
  icon: typeof Wallet;
};

export function ProjectionSimulatorCard({ currentDate, summary }: ProjectionSimulatorCardProps) {
  const [simulation, setSimulation] = useState<ProjectionSimulation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const options = useMemo(() => buildScenarioOptions(summary, currentDate), [currentDate, summary]);

  const runSimulation = async (scenario: ProjectionScenario) => {
    setIsLoading(true);
    setError(null);
    try {
      setSimulation(await simulateProjection({ month: summary.month, scenario }));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No pudimos simular este escenario.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-black uppercase tracking-normal text-primary">Simulación ligera</p>
          <h2 className="mt-2 text-xl font-black tracking-normal text-foreground">Antes de decidir, prueba el impacto.</h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-muted-foreground">
            Una lectura breve para entender cómo cambia tu margen sin convertirlo en calculadora.
          </p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-primary">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        {options.map((option) => (
          <Button
            key={option.label}
            type="button"
            variant="outline"
            className="h-auto justify-start rounded-2xl px-3 py-3 text-left"
            disabled={isLoading}
            onClick={() => void runSimulation(option.scenario)}
          >
            <option.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="min-w-0">
              <span className="block text-sm font-black">{option.label}</span>
              <span className="block text-xs font-bold text-muted-foreground">{option.description}</span>
            </span>
          </Button>
        ))}
      </div>

      {isLoading && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-teal-50/80 px-4 py-3 text-sm font-black text-primary">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Calculando impacto...
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          {error}
        </div>
      )}

      {simulation && !isLoading && (
        <div className="mt-4 rounded-[1.35rem] border border-teal-100 bg-teal-50/70 p-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <ImpactMetric label="Disponible hoy" before={simulation.safeToSpendTodayBefore} after={simulation.safeToSpendTodayAfter} />
            <ImpactMetric label="Cierre proyectado" before={simulation.projectedEndOfMonthBefore} after={simulation.projectedEndOfMonthAfter} />
          </div>
          <p className="mt-3 text-sm font-semibold leading-6 text-teal-900">{simulation.explanation}</p>
          {simulation.creditCardPurchase && (
            <p className="mt-2 rounded-2xl bg-white/75 px-3 py-2 text-xs font-black text-primary">
              Esta compra caería en el corte del {formatTransactionDate(simulation.creditCardPurchase.statementEndDate)} y se pagaría el {formatTransactionDate(simulation.creditCardPurchase.paymentDueDate)}.
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

function buildScenarioOptions(summary: DashboardSummary, currentDate: Date): ScenarioOption[] {
  const options: ScenarioOption[] = [
    {
      label: "¿Qué pasa si gasto $1,000?",
      description: "Mide el efecto sobre tu margen diario.",
      scenario: { extraExpense: 1000 },
      icon: Wallet,
    },
  ];
  const savingMilestone = (summary.upcomingObligations ?? []).find((obligation) => obligation.source === "saving_milestone");
  const creditCard = (summary.upcomingObligations ?? []).find((obligation) => obligation.source === "credit_card_statement");

  if (savingMilestone) {
    options.push({
      label: `¿Qué pasa si pauso ${savingMilestone.name}?`,
      description: "Libera temporalmente esa reserva.",
      scenario: { pauseSavingMilestoneIds: [savingMilestone.id.replace("saving-milestone:", "")] },
      icon: Pause,
    });
  }

  if (creditCard) {
    options.push({
      label: "¿Qué pasa si compro con tarjeta?",
      description: "Revisa corte y fecha de pago.",
      scenario: {
        creditCardPurchase: {
          amount: 1000,
          creditCardId: extractCreditCardId(creditCard.id),
          date: currentDate.toISOString().slice(0, 10),
        },
      },
      icon: CreditCard,
    });
  }

  return options;
}

function extractCreditCardId(id: string) {
  return id.replace("credit-card-statement:", "").split(":")[0] ?? id;
}

function ImpactMetric({ after, before, label }: { after: number; before: number; label: string }) {
  return (
    <div className="rounded-2xl bg-white/75 px-3 py-3">
      <p className="text-xs font-black uppercase tracking-normal text-primary">{label}</p>
      <p className="mt-1 text-lg font-black text-foreground">{formatCurrency(after)}</p>
      <p className="mt-1 text-xs font-bold text-muted-foreground">Antes {formatCurrency(before)}</p>
    </div>
  );
}

import { Bell, CircleDollarSign, DatabaseZap, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTransactionStore } from "@/stores/transactionStore";
import { formatCurrency } from "@/lib/formatters";

export function SettingsPage() {
  const monthlyBudget = useTransactionStore((state) => state.monthlyBudget);

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Card className="p-5 lg:col-span-2">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-100 text-primary">
            <Wallet className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-normal text-foreground">Preferencias iniciales</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              La primera fase mantiene datos mock en memoria para validar la experiencia de captura y lectura.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <SettingRow icon={CircleDollarSign} label="Presupuesto mensual" value={formatCurrency(monthlyBudget)} />
          <SettingRow icon={CircleDollarSign} label="Moneda" value="MXN" />
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-100 text-lime-700">
          <DatabaseZap className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-lg font-bold tracking-normal text-foreground">Persistencia</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Supabase, backend o localStorage se conectarán después. Por ahora los datos viven solo en memoria.
        </p>
        <Badge tone="warning" className="mt-4">
          Fase mock
        </Badge>
      </Card>

      <Card className="p-5 lg:col-span-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <Bell className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-normal text-foreground">Avisos</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Aquí quedará espacio para recordatorios, alertas de presupuesto y ajustes reales cuando se conecte persistencia.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

type SettingRowProps = {
  icon: typeof CircleDollarSign;
  label: string;
  value: string;
};

function SettingRow({ icon: Icon, label, value }: SettingRowProps) {
  return (
    <div className="rounded-2xl border border-border bg-white/72 p-4">
      <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
      <p className="mt-3 text-sm font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold tracking-normal text-foreground">{value}</p>
    </div>
  );
}

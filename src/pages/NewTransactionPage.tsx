import { TransactionForm } from "@/components/transactions/TransactionForm";

export function NewTransactionPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <section className="px-1">
        <h2 className="text-2xl font-bold tracking-normal text-foreground">Registra un movimiento</h2>
        <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-muted-foreground">
          Monto, categoría y método. Lo esencial para mantener tu mes bajo control.
        </p>
      </section>
      <TransactionForm />
    </div>
  );
}

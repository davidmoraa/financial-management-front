import { useEffect, useMemo, useState } from "react";
import { CreditCard, Pencil, Plus, Trash2 } from "lucide-react";
import { CreditCardForm } from "@/components/credit-cards/CreditCardForm";
import { AppConfirmDialog } from "@/components/feedback/AppConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCreditCardStore } from "@/stores/creditCardStore";
import type { CreditCard as CreditCardModel, CreditCardInput } from "@/types/creditCards";
import { formatCurrency } from "@/lib/formatters";

export function CreditCardsPage() {
  const creditCards = useCreditCardStore((state) => state.creditCards);
  const hydrate = useCreditCardStore((state) => state.hydrate);
  const createCreditCard = useCreditCardStore((state) => state.createCreditCard);
  const updateCreditCard = useCreditCardStore((state) => state.updateCreditCard);
  const deleteCreditCard = useCreditCardStore((state) => state.deleteCreditCard);
  const isLoading = useCreditCardStore((state) => state.isLoading);
  const error = useCreditCardStore((state) => state.error);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingCard, setDeletingCard] = useState<CreditCardModel | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const editingCard = useMemo(
    () => creditCards.find((card) => card.id === editingId),
    [creditCards, editingId],
  );

  const handleSubmit = async (input: CreditCardInput) => {
    setIsSubmitting(true);
    try {
      if (editingCard) {
        await updateCreditCard(editingCard.id, input);
        setEditingId(null);
      } else {
        await createCreditCard(input);
        setShowForm(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-[1.8rem] bg-white/80 p-5 shadow-soft">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Pagos a crédito</p>
            <h2 className="mt-2 text-2xl font-black tracking-normal text-foreground">Tarjetas de crédito</h2>
            <p className="mt-1 text-sm font-medium leading-6 text-muted-foreground">
              Define corte y fecha límite para asociar movimientos sin cambiar tus proyecciones todavía.
            </p>
          </div>
          <Button onClick={() => { setEditingId(null); setShowForm(true); }}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Crear tarjeta
          </Button>
        </div>
      </section>

      {(showForm || editingCard) && (
        <Card className="p-5">
          <CreditCardForm
            initialValue={editingCard}
            isSubmitting={isSubmitting}
            onCancel={() => {
              setShowForm(false);
              setEditingId(null);
            }}
            onSubmit={handleSubmit}
          />
        </Card>
      )}

      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          {error}
        </div>
      )}

      {!isLoading && creditCards.length === 0 && !showForm && (
        <Card className="p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-teal-100 text-primary">
            <CreditCard className="h-7 w-7" aria-hidden="true" />
          </div>
          <h3 className="mt-4 text-xl font-black tracking-normal text-foreground">Todavía no tienes tarjetas.</h3>
          <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-muted-foreground">
            Agrega una tarjeta para poder asignarla cuando registres movimientos a crédito.
          </p>
          <Button className="mt-5" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Agregar primera tarjeta
          </Button>
        </Card>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {creditCards.map((card) => (
          <Card key={card.id} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-soft"
                  style={{ backgroundColor: card.color ?? "#0f766e" }}
                >
                  <CreditCard className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-black tracking-normal text-foreground">{card.name}</h3>
                  <p className="truncate text-sm font-semibold text-muted-foreground">
                    {card.bankName ?? "Tarjeta"} {card.lastFourDigits ? `· ${card.lastFourDigits}` : ""}
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-primary">
                {card.isActive ? "Activa" : "Inactiva"}
              </span>
            </div>

            <div className="mt-5 grid gap-2 rounded-2xl bg-teal-50/70 p-4 text-sm font-bold text-foreground">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Corte</span>
                <span>Día {card.statementClosingDay}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Pago límite</span>
                <span>Día {card.paymentDueDay} · {card.paymentDueMonthOffset === 1 ? "mes siguiente" : "mismo mes"}</span>
              </div>
              {typeof card.creditLimit === "number" && (
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Límite</span>
                  <span>{formatCurrency(card.creditLimit)}</span>
                </div>
              )}
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(card.id); }}>
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Editar
              </Button>
              <Button variant="outline" onClick={() => setDeletingCard(card)} disabled={!card.isActive}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Desactivar
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <AppConfirmDialog
        open={Boolean(deletingCard)}
        eyebrow="Tarjeta de crédito"
        title={`¿Desactivar ${deletingCard?.name ?? "esta tarjeta"}?`}
        description="La tarjeta dejará de aparecer al registrar nuevos movimientos, pero los movimientos anteriores conservarán su referencia."
        confirmLabel="Desactivar tarjeta"
        cancelLabel="Volver"
        tone="warning"
        onCancel={() => setDeletingCard(null)}
        onConfirm={() => {
          if (!deletingCard) return;
          void deleteCreditCard(deletingCard.id).finally(() => setDeletingCard(null));
        }}
      />
    </div>
  );
}

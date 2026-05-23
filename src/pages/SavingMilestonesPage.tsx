import { useEffect, useMemo, useState } from "react";
import { Plus, Target } from "lucide-react";
import { AppConfirmDialog } from "@/components/feedback/AppConfirmDialog";
import { SavingMilestoneCard } from "@/components/saving-milestones/SavingMilestoneCard";
import { SavingMilestoneForm } from "@/components/saving-milestones/SavingMilestoneForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSavingMilestoneStore } from "@/stores/savingMilestoneStore";
import type { SavingMilestone, SavingMilestoneInput } from "@/types/savingMilestones";
import { formatCurrency } from "@/lib/formatters";

export function SavingMilestonesPage() {
  const savingMilestones = useSavingMilestoneStore((state) => state.savingMilestones);
  const hydrate = useSavingMilestoneStore((state) => state.hydrate);
  const createSavingMilestone = useSavingMilestoneStore((state) => state.createSavingMilestone);
  const updateSavingMilestone = useSavingMilestoneStore((state) => state.updateSavingMilestone);
  const deleteSavingMilestone = useSavingMilestoneStore((state) => state.deleteSavingMilestone);
  const isLoading = useSavingMilestoneStore((state) => state.isLoading);
  const error = useSavingMilestoneStore((state) => state.error);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingMilestone, setDeletingMilestone] = useState<SavingMilestone | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const activeMilestones = savingMilestones.filter((milestone) => milestone.isActive);
  const totalRemaining = activeMilestones.reduce((total, milestone) => total + milestone.projection.remainingAmount, 0);
  const editingMilestone = useMemo(
    () => savingMilestones.find((milestone) => milestone.id === editingId),
    [editingId, savingMilestones],
  );

  const handleSubmit = async (input: SavingMilestoneInput) => {
    setIsSubmitting(true);
    try {
      if (editingMilestone) {
        await updateSavingMilestone(editingMilestone.id, input);
        setEditingId(null);
      } else {
        await createSavingMilestone(input);
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
            <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Metas de ahorro</p>
            <h2 className="mt-2 text-2xl font-black tracking-normal text-foreground">Objetivos con fecha</h2>
            <p className="mt-1 text-sm font-medium leading-6 text-muted-foreground">
              Convierte objetivos concretos en una aportación clara y sostenible.
            </p>
          </div>
          <Button onClick={() => { setEditingId(null); setShowForm(true); }}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Crear meta
          </Button>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-3">
        <SummaryCard label="Metas activas" value={String(activeMilestones.length)} />
        <SummaryCard label="Por completar" value={formatCurrency(totalRemaining)} />
        <SummaryCard
          label="En tiempo"
          value={String(activeMilestones.filter((milestone) => milestone.projection.health === "on_track").length)}
        />
      </div>

      {(showForm || editingMilestone) && (
        <Card className="p-5">
          <SavingMilestoneForm
            initialValue={editingMilestone}
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

      {!isLoading && savingMilestones.length === 0 && !showForm && (
        <Card className="p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-lime-100 text-lime-700">
            <Target className="h-7 w-7" aria-hidden="true" />
          </div>
          <h3 className="mt-4 text-xl font-black tracking-normal text-foreground">Todavía no tienes metas.</h3>
          <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-muted-foreground">
            Crea una meta para saber cuánto apartar sin perder claridad de tu mes.
          </p>
          <Button className="mt-5" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Crear primera meta
          </Button>
        </Card>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {savingMilestones.map((milestone) => (
          <SavingMilestoneCard
            key={milestone.id}
            milestone={milestone}
            onDelete={() => setDeletingMilestone(milestone)}
            onEdit={() => {
              setShowForm(false);
              setEditingId(milestone.id);
            }}
          />
        ))}
      </div>

      <AppConfirmDialog
        open={Boolean(deletingMilestone)}
        eyebrow="Meta de ahorro"
        title={`¿Desactivar ${deletingMilestone?.name ?? "esta meta"}?`}
        description="La meta dejará de aparecer como activa, pero conservarás el registro para referencia."
        confirmLabel="Desactivar meta"
        cancelLabel="Volver"
        tone="warning"
        onCancel={() => setDeletingMilestone(null)}
        onConfirm={() => {
          if (!deletingMilestone) return;
          void deleteSavingMilestone(deletingMilestone.id).finally(() => setDeletingMilestone(null));
        }}
      />
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">{label}</p>
      <p className="mt-2 text-2xl font-black tracking-normal text-foreground">{value}</p>
    </Card>
  );
}

import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MoneyFluxLogo } from "@/components/brand/MoneyFluxLogo";
import { cn } from "@/lib/utils";

type AppConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  eyebrow?: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "danger" | "warning";
  isConfirming?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

export function AppConfirmDialog({
  open,
  title,
  description,
  eyebrow = "Confirmación",
  confirmLabel,
  cancelLabel = "Cancelar",
  tone = "danger",
  isConfirming = false,
  onConfirm,
  onCancel,
}: AppConfirmDialogProps) {
  if (!open) {
    return null;
  }

  const isDanger = tone === "danger";

  return (
    <div className="fixed inset-0 z-[70] flex items-end bg-slate-950/60 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6 backdrop-blur-[4px] sm:items-center sm:justify-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-confirm-title"
        className="w-full max-w-[25rem] overflow-hidden rounded-[1.35rem] border border-white/95 bg-white shadow-[0_28px_90px_-34px_rgba(16,24,40,0.72)]"
      >
        <div
          className={cn(
            "h-1.5",
            isDanger ? "bg-gradient-to-r from-red-600 via-rose-500 to-amber-300" : "bg-gradient-to-r from-amber-500 via-lime-300 to-teal-500",
          )}
        />
        <div className="p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <MoneyFluxLogo size="sm" className="h-8 w-8 rounded-xl shadow-none ring-1 ring-slate-100" />
              <span className="truncate text-sm font-bold text-slate-950">Money Flux</span>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em]",
                isDanger ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700",
              )}
            >
              {eyebrow}
            </span>
          </div>
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1",
                isDanger ? "bg-red-50 text-red-700 ring-red-100" : "bg-amber-50 text-amber-700 ring-amber-100",
              )}
            >
              <TriangleAlert className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 id="app-confirm-title" className="text-lg font-bold leading-6 text-slate-950">
                {title}
              </h2>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{description}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-2.5">
            <Button
              type="button"
              className={cn(
                "h-12 rounded-2xl text-sm font-bold text-white shadow-none",
                isDanger ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700",
              )}
              disabled={isConfirming}
              onClick={() => void onConfirm()}
            >
              {isConfirming ? "Procesando..." : confirmLabel}
            </Button>
            <Button
              type="button"
              className="h-12 rounded-2xl border-slate-200 bg-white text-sm font-bold text-slate-800 hover:bg-slate-50"
              variant="outline"
              disabled={isConfirming}
              onClick={onCancel}
            >
              {cancelLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

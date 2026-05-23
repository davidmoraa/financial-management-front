import { create } from "zustand";
import type { SavingMilestone, SavingMilestoneInput } from "@/types/savingMilestones";

type SavingMilestoneState = {
  error?: string;
  isLoading: boolean;
  isHydrated: boolean;
  savingMilestones: SavingMilestone[];
  hydrate: () => Promise<void>;
  refreshSavingMilestones: () => Promise<void>;
  createSavingMilestone: (input: SavingMilestoneInput) => Promise<SavingMilestone>;
  updateSavingMilestone: (id: string, input: Partial<SavingMilestoneInput>) => Promise<SavingMilestone>;
  deleteSavingMilestone: (id: string) => Promise<SavingMilestone>;
};

export const useSavingMilestoneStore = create<SavingMilestoneState>((set) => ({
  error: undefined,
  isLoading: false,
  isHydrated: false,
  savingMilestones: [],
  hydrate: async () => {
    set({ isLoading: true, error: undefined });
    try {
      const { fetchSavingMilestones } = await import("@/services/savingMilestonesApi");
      set({
        savingMilestones: await fetchSavingMilestones(),
        isHydrated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "No se pudieron cargar tus metas.",
        isHydrated: true,
        isLoading: false,
      });
    }
  },
  refreshSavingMilestones: async () => {
    const { fetchSavingMilestones } = await import("@/services/savingMilestonesApi");
    set({ savingMilestones: await fetchSavingMilestones(), isHydrated: true });
  },
  createSavingMilestone: async (input) => {
    const { createRemoteSavingMilestone } = await import("@/services/savingMilestonesApi");
    const savingMilestone = await createRemoteSavingMilestone(input);
    set((state) => ({
      savingMilestones: [savingMilestone, ...state.savingMilestones],
      error: undefined,
    }));
    return savingMilestone;
  },
  updateSavingMilestone: async (id, input) => {
    const { updateRemoteSavingMilestone } = await import("@/services/savingMilestonesApi");
    const savingMilestone = await updateRemoteSavingMilestone(id, input);
    set((state) => ({
      savingMilestones: state.savingMilestones.map((current) => current.id === id ? savingMilestone : current),
      error: undefined,
    }));
    return savingMilestone;
  },
  deleteSavingMilestone: async (id) => {
    const { deleteRemoteSavingMilestone } = await import("@/services/savingMilestonesApi");
    const savingMilestone = await deleteRemoteSavingMilestone(id);
    set((state) => ({
      savingMilestones: state.savingMilestones.map((current) => current.id === id ? savingMilestone : current),
      error: undefined,
    }));
    return savingMilestone;
  },
}));

import { create } from "zustand";
import { AUTH_TOKEN_STORAGE_KEY } from "@/lib/api/client";
import {
  cacheRemoteCreditCard,
  cacheRemoteCreditCards,
  getActiveCreditCards,
  getAllCreditCards,
} from "@/lib/offline/creditCardRepository";
import {
  createRemoteCreditCard,
  deleteRemoteCreditCard,
  fetchCreditCards,
  updateRemoteCreditCard,
} from "@/services/creditCardsApi";
import type { CreditCard, CreditCardInput } from "@/types/creditCards";

type CreditCardState = {
  creditCards: CreditCard[];
  isHydrated: boolean;
  isLoading: boolean;
  error?: string;
  hydrate: () => Promise<void>;
  refreshCreditCards: () => Promise<void>;
  getActiveCreditCards: () => CreditCard[];
  createCreditCard: (input: CreditCardInput) => Promise<CreditCard>;
  updateCreditCard: (id: string, input: Partial<CreditCardInput>) => Promise<CreditCard>;
  deleteCreditCard: (id: string) => Promise<CreditCard>;
};

export const useCreditCardStore = create<CreditCardState>((set, get) => ({
  creditCards: [],
  isHydrated: false,
  isLoading: false,
  error: undefined,
  hydrate: async () => {
    if (get().isLoading) {
      return;
    }

    set({ isLoading: true, error: undefined });
    try {
      if (canFetchRemoteData()) {
        await cacheRemoteCreditCards(await fetchCreditCards());
      }

      set({
        creditCards: await getAllCreditCards(),
        isHydrated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        creditCards: await getAllCreditCards(),
        isHydrated: true,
        isLoading: false,
        error: error instanceof Error ? error.message : "No se pudieron cargar las tarjetas.",
      });
    }
  },
  refreshCreditCards: async () => {
    if (canFetchRemoteData()) {
      await cacheRemoteCreditCards(await fetchCreditCards());
    }
    set({ creditCards: await getAllCreditCards(), isHydrated: true });
  },
  getActiveCreditCards: () => get().creditCards.filter((card) => card.isActive),
  createCreditCard: async (input) => {
    const creditCard = await createRemoteCreditCard({ ...input, paymentDueMonthOffset: input.paymentDueMonthOffset ?? 1 });
    await cacheRemoteCreditCard(creditCard);
    set({ creditCards: await getAllCreditCards(), error: undefined });
    return creditCard;
  },
  updateCreditCard: async (id, input) => {
    const creditCard = await updateRemoteCreditCard(id, input);
    await cacheRemoteCreditCard(creditCard);
    set({ creditCards: await getAllCreditCards(), error: undefined });
    return creditCard;
  },
  deleteCreditCard: async (id) => {
    const creditCard = await deleteRemoteCreditCard(id);
    await cacheRemoteCreditCard(creditCard);
    set({ creditCards: await getAllCreditCards(), error: undefined });
    return creditCard;
  },
}));

export async function loadActiveCreditCardsFromIndexedDb() {
  return getActiveCreditCards();
}

function canFetchRemoteData() {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)) && window.navigator.onLine;
}

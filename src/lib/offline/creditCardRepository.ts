import { financeDb } from "@/lib/offline/db";
import type { CreditCard } from "@/types/creditCards";

export async function getAllCreditCards() {
  return financeDb.creditCards.orderBy("name").toArray();
}

export async function getActiveCreditCards() {
  const cards = await getAllCreditCards();
  return cards.filter((card) => card.isActive);
}

export async function cacheRemoteCreditCards(cards: CreditCard[]) {
  await financeDb.creditCards.bulkPut(cards);
  return cards;
}

export async function cacheRemoteCreditCard(card: CreditCard) {
  await financeDb.creditCards.put(card);
  return card;
}

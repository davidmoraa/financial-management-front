import { apiClient } from "@/lib/api/client";
import type { CreditCard, CreditCardInput, CreditCardPaymentObligation } from "@/types/creditCards";

type CreditCardsResponse = {
  creditCards: CreditCard[];
};

type CreditCardResponse = {
  creditCard: CreditCard;
};

type CreditCardObligationsResponse = {
  obligations: CreditCardPaymentObligation[];
};

export async function fetchCreditCards() {
  const response = await apiClient.get<CreditCardsResponse>("/v1/credit-cards");
  return response.creditCards;
}

export async function createRemoteCreditCard(input: CreditCardInput) {
  const response = await apiClient.post<CreditCardResponse>("/v1/credit-cards", input);
  return response.creditCard;
}

export async function updateRemoteCreditCard(id: string, input: Partial<CreditCardInput>) {
  const response = await apiClient.patch<CreditCardResponse>(`/v1/credit-cards/${id}`, input);
  return response.creditCard;
}

export async function deleteRemoteCreditCard(id: string) {
  const response = await apiClient.delete<CreditCardResponse>(`/v1/credit-cards/${id}`);
  return response.creditCard;
}

export async function fetchCreditCardObligations(from: string, to: string) {
  const response = await apiClient.get<CreditCardObligationsResponse>(
    `/v1/credit-cards/obligations?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
  );
  return response.obligations;
}

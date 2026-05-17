import { apiClient } from "@/lib/api/client";
import type { Transaction } from "@/types/finance";

export type RemoteTransaction = Omit<Transaction, "syncStatus">;

type TransactionsResponse = {
  transactions: RemoteTransaction[];
};

type TransactionResponse = {
  transaction: RemoteTransaction;
};

export async function fetchTransactions() {
  const response = await apiClient.get<TransactionsResponse>("/v1/transactions");
  return response.transactions;
}

export async function createRemoteTransaction(transaction: RemoteTransaction) {
  const response = await apiClient.post<TransactionResponse>("/v1/transactions", transaction);
  return response.transaction;
}

export async function updateRemoteTransaction(id: string, transaction: Omit<RemoteTransaction, "id">) {
  const response = await apiClient.patch<TransactionResponse>(`/v1/transactions/${id}`, transaction);
  return response.transaction;
}

export async function deleteRemoteTransaction(id: string) {
  const response = await apiClient.delete<TransactionResponse>(`/v1/transactions/${id}`);
  return response.transaction;
}

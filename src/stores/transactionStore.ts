import { create } from "zustand";
import { isSameMonth, parseISO, subDays } from "date-fns";
import type { MonthlySummary, Transaction } from "@/types/finance";
import type { TransactionFormValues } from "@/schemas/transactionSchema";
import { useCategoryStore } from "@/stores/categoryStore";

type TransactionState = {
  transactions: Transaction[];
  monthlyBudget: number;
  addTransaction: (values: TransactionFormValues) => Transaction;
  updateTransaction: (id: string, values: TransactionFormValues) => void;
  deleteTransaction: (id: string) => void;
  getTransactionsByMonth: (date: Date) => Transaction[];
  getRecentTransactions: (limit?: number) => Transaction[];
  getMonthlySummary: (date: Date) => MonthlySummary;
};

const now = new Date();
const isoDaysAgo = (days: number) => subDays(now, days).toISOString();

const mockTransactions: Transaction[] = [
  {
    id: "tx-001",
    type: "income",
    amount: 32000,
    categoryId: "salary",
    categoryName: "Sueldo",
    paymentMethod: "transfer",
    transactionDate: isoDaysAgo(9),
    note: "Nómina mensual",
    createdAt: isoDaysAgo(9),
    updatedAt: isoDaysAgo(9),
  },
  {
    id: "tx-002",
    type: "expense",
    amount: 1240,
    categoryId: "food",
    categoryName: "Comida",
    paymentMethod: "debit_card",
    transactionDate: isoDaysAgo(2),
    note: "Super y despensa",
    createdAt: isoDaysAgo(2),
    updatedAt: isoDaysAgo(2),
  },
  {
    id: "tx-003",
    type: "expense",
    amount: 680,
    categoryId: "transport",
    categoryName: "Transporte",
    paymentMethod: "credit_card",
    transactionDate: isoDaysAgo(3),
    createdAt: isoDaysAgo(3),
    updatedAt: isoDaysAgo(3),
  },
  {
    id: "tx-004",
    type: "income",
    amount: 4200,
    categoryId: "freelance",
    categoryName: "Freelance",
    paymentMethod: "transfer",
    transactionDate: isoDaysAgo(5),
    note: "Proyecto corto",
    createdAt: isoDaysAgo(5),
    updatedAt: isoDaysAgo(5),
  },
  {
    id: "tx-005",
    type: "expense",
    amount: 299,
    categoryId: "subscriptions",
    categoryName: "Suscripciones",
    paymentMethod: "credit_card",
    transactionDate: isoDaysAgo(1),
    note: "Música",
    createdAt: isoDaysAgo(1),
    updatedAt: isoDaysAgo(1),
  },
];

function createTransaction(values: TransactionFormValues): Transaction {
  const category = useCategoryStore.getState().getCategoryById(values.categoryId);
  const timestamp = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    type: values.type,
    amount: values.amount,
    categoryId: values.categoryId,
    categoryName: category?.name ?? "Sin categoría",
    paymentMethod: values.paymentMethod,
    transactionDate: values.transactionDate,
    note: values.note?.trim() || undefined,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: mockTransactions,
  monthlyBudget: 15000,
  addTransaction: (values) => {
    const transaction = createTransaction(values);
    set((state) => ({ transactions: [transaction, ...state.transactions] }));
    return transaction;
  },
  updateTransaction: (id, values) => {
    const category = useCategoryStore.getState().getCategoryById(values.categoryId);
    set((state) => ({
      transactions: state.transactions.map((transaction) =>
        transaction.id === id
          ? {
              ...transaction,
              ...values,
              categoryName: category?.name ?? transaction.categoryName,
              note: values.note?.trim() || undefined,
              updatedAt: new Date().toISOString(),
            }
          : transaction,
      ),
    }));
  },
  deleteTransaction: (id) => {
    set((state) => ({
      transactions: state.transactions.filter((transaction) => transaction.id !== id),
    }));
  },
  getTransactionsByMonth: (date) =>
    get()
      .transactions.filter((transaction) => isSameMonth(parseISO(transaction.transactionDate), date))
      .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()),
  getRecentTransactions: (limit = 5) =>
    [...get().transactions]
      .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
      .slice(0, limit),
  getMonthlySummary: (date) => {
    const monthTransactions = get().getTransactionsByMonth(date);
    const income = monthTransactions
      .filter((transaction) => transaction.type === "income")
      .reduce((total, transaction) => total + transaction.amount, 0);
    const expense = monthTransactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((total, transaction) => total + transaction.amount, 0);
    const budget = get().monthlyBudget;

    return {
      income,
      expense,
      balance: income - expense,
      budget,
      budgetUsedPercentage: budget > 0 ? Math.round((expense / budget) * 100) : 0,
    };
  },
}));

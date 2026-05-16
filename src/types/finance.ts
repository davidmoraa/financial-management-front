export type TransactionType = "income" | "expense";

export type PaymentMethod =
  | "cash"
  | "debit_card"
  | "credit_card"
  | "transfer"
  | "other";

export type Category = {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
};

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  categoryName: string;
  paymentMethod: PaymentMethod;
  transactionDate: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type MonthlySummary = {
  income: number;
  expense: number;
  balance: number;
  budget: number;
  budgetUsedPercentage: number;
};

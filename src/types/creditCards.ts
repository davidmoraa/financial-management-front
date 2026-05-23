export type CreditCard = {
  id: string;
  name: string;
  bankName?: string;
  lastFourDigits?: string;
  creditLimit?: number;
  statementClosingDay: number;
  paymentDueDay: number;
  paymentDueMonthOffset: 0 | 1;
  color?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreditCardInput = {
  name: string;
  bankName?: string | null;
  lastFourDigits?: string | null;
  creditLimit?: number | null;
  statementClosingDay: number;
  paymentDueDay: number;
  paymentDueMonthOffset?: 0 | 1;
  color?: string | null;
  isActive?: boolean;
};

export type CreditCardPaymentObligation = {
  id: string;
  creditCardId: string;
  creditCardName: string;
  statementStartDate: string;
  statementEndDate: string;
  paymentDueDate: string;
  amount: number;
  status: "upcoming" | "due_soon" | "overdue" | "paid";
  movementsCount: number;
};

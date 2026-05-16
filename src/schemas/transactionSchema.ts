import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["income", "expense"], {
    required_error: "Elige si es ingreso o gasto.",
  }),
  amount: z.coerce
    .number({ required_error: "Ingresa un monto." })
    .positive("El monto debe ser mayor a 0."),
  categoryId: z.string().min(1, "Elige una categoría."),
  paymentMethod: z.enum(["cash", "debit_card", "credit_card", "transfer", "other"], {
    required_error: "Elige un método de pago.",
  }),
  transactionDate: z.string().min(1, "Elige una fecha."),
  note: z.string().max(160, "Máximo 160 caracteres.").optional(),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;

import { MovementRegisteredFeedback } from "@/components/feedback/MovementRegisteredFeedback";
import type { TransactionType } from "@/types/finance";

type SuccessPulseProps = {
  amount?: number;
  categoryName?: string;
  show: boolean;
  type?: TransactionType;
};

export function SuccessPulse(props: SuccessPulseProps) {
  return <MovementRegisteredFeedback {...props} />;
}

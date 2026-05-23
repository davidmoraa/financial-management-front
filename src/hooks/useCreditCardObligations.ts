import { useEffect, useState } from "react";
import { fetchCreditCardObligations } from "@/services/creditCardsApi";
import type { CreditCardPaymentObligation } from "@/types/creditCards";

type CreditCardObligationsState = {
  data: CreditCardPaymentObligation[];
  error?: Error;
  isLoading: boolean;
};

export function useCreditCardObligations(from: string, to: string) {
  const [state, setState] = useState<CreditCardObligationsState>({
    data: [],
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;

    setState((current) => ({
      data: current.data,
      error: undefined,
      isLoading: true,
    }));

    fetchCreditCardObligations(from, to)
      .then((obligations) => {
        if (!cancelled) {
          setState({ data: obligations, isLoading: false });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            data: [],
            error: error instanceof Error ? error : new Error("No se pudieron cargar pagos de tarjeta."),
            isLoading: false,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [from, to]);

  return state;
}

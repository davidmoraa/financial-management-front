export type ProjectionScenario = {
  extraExpense?: number;
  extraIncome?: number;
  pauseSavingMilestoneIds?: string[];
  creditCardPurchase?: {
    amount: number;
    creditCardId: string;
    date: string;
  };
};

export type ProjectionSimulationRequest = {
  month: string;
  scenario: ProjectionScenario;
};

export type ProjectionSimulation = {
  safeToSpendTodayBefore: number;
  safeToSpendTodayAfter: number;
  projectedEndOfMonthBefore: number;
  projectedEndOfMonthAfter: number;
  explanation: string;
  creditCardPurchase?: {
    creditCardId: string;
    creditCardName: string;
    statementStartDate: string;
    statementEndDate: string;
    paymentDueDate: string;
    appliesToCurrentPeriod: boolean;
  };
};

export type ProjectionSimulationResponse = {
  simulation: ProjectionSimulation;
};

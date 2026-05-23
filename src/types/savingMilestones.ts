export type SavingMilestonePriority = "essential" | "important" | "nice_to_have";
export type SavingMilestoneContributionFrequency = "daily" | "weekly" | "biweekly" | "monthly";
export type SavingMilestoneHealth = "on_track" | "needs_attention" | "at_risk" | "completed";

export type SavingMilestoneProjection = {
  remainingAmount: number;
  daysRemaining: number;
  weeksRemaining: number;
  monthsRemaining: number;
  requiredDailyContribution: number;
  requiredWeeklyContribution: number;
  requiredBiweeklyContribution: number;
  requiredMonthlyContribution: number;
  progressPercentage: number;
  health: SavingMilestoneHealth;
};

export type SavingMilestone = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  priority: SavingMilestonePriority;
  contributionFrequency: SavingMilestoneContributionFrequency;
  autoReserve: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  projection: SavingMilestoneProjection;
};

export type SavingMilestoneInput = {
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  priority: SavingMilestonePriority;
  contributionFrequency: SavingMilestoneContributionFrequency;
  autoReserve: boolean;
  isActive?: boolean;
};

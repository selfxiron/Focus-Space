export const GOAL_PERIODS = ["weekly", "monthly"] as const;
export type GoalPeriod = (typeof GOAL_PERIODS)[number];

export const PERIOD_LABELS: Record<GoalPeriod, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
};

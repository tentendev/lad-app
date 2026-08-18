export const EXPENSE_CATEGORIES = [
  "抽卡禮包",
  "月卡/週卡",
  "密約",
  "周邊",
  "其他",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export type Expense = {
  id: number;
  amt: number;
  cat: ExpenseCategory;
  note: string;
  date: string;
};

export type BudgetConfig = {
  amount: number;
  threshold: number;
};

export type BudgetMap = Record<string, BudgetConfig>;

export const POOLS = ["日卡池", "混池", "月卡池", "生日池", "復刻池"] as const;
export type Pool = (typeof POOLS)[number];

export type ReserveUnit = "pulls" | "dia";

export type CalculatorDraft = {
  pool: Pool;
  cur: number;
  tickets: number;
  pulls: number;
  reserve: number;
  reserveUnit: ReserveUnit;
};

export type TicketMilestone = {
  at?: number;
  every?: number;
  reward: number;
  from?: number;
  to?: number;
  maxReward?: number;
};

export type TicketRule = {
  initial: number;
  milestones: TicketMilestone[];
};

export type PackTier = {
  tier: string;
  price: number;
  qty?: number;
  packPulls: number | null;
  cumPulls: number;
  cumCost: number;
  per: number | null;
};

export type ScheduleEventType =
  | "merch"
  | "daily"
  | "monthly"
  | "mixed"
  | "birthday"
  | "rerun"
  | "pass"
  | "story";

export const LEADS = ["沈星回", "黎深", "祁煜", "秦徹", "夏以晝"] as const;
export type Lead = (typeof LEADS)[number];

export type ScheduleEvent = {
  name: string;
  type: ScheduleEventType;
  start: string;
  end: string;
  tentative: boolean;
  leads?: Lead[];
  cost?: number;
};

export type PendingExpense = {
  amt: number;
  cat: ExpenseCategory;
  note: string;
  date: string;
};

export type PendingCalculatorTarget = {
  pulls: number;
  pool: Pool | null;
  source: string;
};

export type PullGoal = {
  id: number;
  title: string;
  pool: Pool;
  targetPulls: number;
  deadline: string;
  tentative: boolean;
  enabled: boolean;
  sourceEvent: string | null;
};

export type PullGoalDraft = Omit<PullGoal, "id">;

export type ResourceCheckIn = {
  id: number;
  date: string;
  diamonds: number;
  tickets: number;
  note: string;
};

export type ResourceCheckInDraft = Omit<ResourceCheckIn, "id">;

export type PlannerState = {
  monthlyIncome: number;
  goals: PullGoal[];
  checkIns: ResourceCheckIn[];
};

export const WISH_TRACKS = ["限定新池", "復刻池", "常駐池"] as const;
export type WishTrack = (typeof WISH_TRACKS)[number];

export const FIVE_STAR_OUTCOMES = ["當期UP", "非當期", "未標記"] as const;
export type FiveStarOutcome = (typeof FIVE_STAR_OUTCOMES)[number];

export type FiveStarRecord = {
  id: number;
  track: WishTrack;
  pity: number;
  date: string;
  memory: string;
  outcome: FiveStarOutcome;
};

export type FiveStarRecordDraft = Omit<FiveStarRecord, "id">;

export type WishTrackerState = {
  currentPity: Record<WishTrack, number>;
  guaranteeOverrides: Record<WishTrack, true | false | null>;
  records: FiveStarRecord[];
};

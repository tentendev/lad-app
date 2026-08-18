export type StorageRepository = {
  get<T>(key: string, fallback: T): Promise<T>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  getRaw(key: string): Promise<string | null>;
  setRaw(key: string, value: string | null): Promise<void>;
};

export const STORAGE_PREFIX = "lad_";

export const STORAGE_KEYS = {
  legacyBudget: "budget",
  budgets: "budgets",
  expenses: "expenses",
  calculator: "calc",
  planner: "planner",
  wishTracker: "wish_tracker",
  schedulePreferences: "schedule_preferences",
  pendingExpense: "pending_expense",
  pendingPullGoal: "pending_pull_goal",
  pendingCalculatorTarget: "pending_calculator_target",
} as const;

export function parseStored<T>(value: string | null, fallback: T): T {
  if (value == null) return fallback;
  try {
    return (JSON.parse(value) as T) ?? fallback;
  } catch {
    throw new Error("stored JSON is invalid");
  }
}

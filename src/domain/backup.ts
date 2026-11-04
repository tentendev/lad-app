import { CURRENCIES, POOLS, type Currency, type BudgetMap, type CalculatorDraft, type Expense, type PlannerState, type WishTrackerState } from "./types";
import { normalizePool } from "../data/packs";
import { isValidBudgetKey, normalizeStoredExpenses } from "./budget";
import { normalizeCalculatorDraft } from "./calculator";
import { normalizePlannerState } from "./planner";
import { normalizeSchedulePreferences } from "./schedule";
import { normalizeWishTrackerState } from "./wishTracker";
import type { SchedulePreferences } from "./schedule";

const BACKUP_PRODUCT = "deep-space-ledger";
const BACKUP_VERSION = 5;
const SUPPORTED_BACKUP_VERSIONS = [1, 2, 3, 4, BACKUP_VERSION];

export type LocalBackupData = {
  budgets: BudgetMap;
  expenses: Expense[];
  calculator: CalculatorDraft | null;
  planner: PlannerState;
  wishTracker: WishTrackerState;
  /** Null only when reading a legacy local/cloud snapshot that predates schedule preferences. */
  schedulePreferences: SchedulePreferences | null;
};

export type LocalBackup = {
  product: typeof BACKUP_PRODUCT;
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  data: LocalBackupData;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNonNegative(value: unknown): value is number {
  return typeof value === "number"
    && Number.isFinite(value)
    && value >= 0
    && value <= Number.MAX_SAFE_INTEGER;
}

function parseBudgets(value: unknown): BudgetMap {
  if (!isRecord(value)) throw new Error("預算資料格式不正確。");
  const budgets: BudgetMap = {};
  for (const [month, config] of Object.entries(value)) {
    if (!isValidBudgetKey(month) || !isRecord(config)) throw new Error("預算月份格式不正確。");
    if (!isFiniteNonNegative(config.amount)) throw new Error("預算金額格式不正確。");
    if (typeof config.threshold !== "number" || !Number.isFinite(config.threshold) || config.threshold < 1 || config.threshold > 100) {
      throw new Error("預算提醒門檻格式不正確。");
    }
    budgets[month] = { amount: config.amount, threshold: config.threshold };
  }
  return budgets;
}

function parseExpenses(value: unknown): Expense[] {
  try {
    return normalizeStoredExpenses(value);
  } catch {
    throw new Error("花費資料格式不正確。");
  }
}

function parseCalculator(value: unknown): CalculatorDraft | null {
  if (value === null) return null;
  if (!isRecord(value)) throw new Error("換算資料格式不正確。");
  if (typeof value.pool !== "string" || (!POOLS.includes(value.pool as never) && !["復刻池", "月卡／生日復刻池"].includes(value.pool))) throw new Error("卡池類型格式不正確。");
  if (value.reserveUnit !== "pulls" && value.reserveUnit !== "dia") throw new Error("預留資源單位格式不正確。");
  for (const key of ["cur", "tickets", "pulls", "reserve"] as const) {
    if (!isFiniteNonNegative(value[key])) throw new Error("換算數字格式不正確。");
  }
  if (value.currency !== undefined && !CURRENCIES.includes(value.currency as Currency)) throw new Error("幣別格式不正確。");
  return normalizeCalculatorDraft({ ...value, pool: normalizePool(value.pool) });
}

function parsePlanner(value: unknown): PlannerState {
  try {
    return normalizePlannerState(value);
  } catch {
    throw new Error("抽卡規劃資料格式不正確。");
  }
}

function parseWishTracker(value: unknown): WishTrackerState {
  try {
    return normalizeWishTrackerState(value);
  } catch {
    throw new Error("五星紀錄資料格式不正確。");
  }
}

export function createLocalBackup(data: LocalBackupData, exportedAt = new Date().toISOString()): LocalBackup {
  return { product: BACKUP_PRODUCT, version: BACKUP_VERSION, exportedAt, data };
}

export function validateLocalBackupData(value: unknown): LocalBackupData {
  if (!isRecord(value)) throw new Error("備份資料格式不正確。");
  return {
    budgets: parseBudgets(value.budgets),
    expenses: parseExpenses(value.expenses),
    calculator: parseCalculator(value.calculator),
    planner: parsePlanner(value.planner),
    wishTracker: parseWishTracker(value.wishTracker),
    schedulePreferences: value.schedulePreferences == null
      ? null
      : normalizeSchedulePreferences(value.schedulePreferences),
  };
}

export function parseLocalBackup(source: string): LocalBackupData {
  let value: unknown;
  try {
    value = JSON.parse(source);
  } catch {
    throw new Error("無法讀取備份檔，請確認檔案是深空省省匯出的 JSON。");
  }
  if (!isRecord(value) || value.product !== BACKUP_PRODUCT || !SUPPORTED_BACKUP_VERSIONS.includes(value.version as number) || !isRecord(value.data)) {
    throw new Error("這不是支援的深空省省備份檔。");
  }
  return validateLocalBackupData(value.data);
}

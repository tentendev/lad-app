import { normalizeBudgetMap, normalizeStoredExpenses } from "@/domain/budget";
import { normalizeCalculatorDraft } from "@/domain/calculator";
import { DEFAULT_PLANNER_STATE, normalizePlannerState } from "@/domain/planner";
import { DEFAULT_SCHEDULE_PREFERENCES, normalizeSchedulePreferences } from "@/domain/schedule";
import { normalizeWishTrackerState } from "@/domain/wishTracker";
import type { LocalBackupData } from "@/domain/backup";

import { STORAGE_KEYS } from "./storage.types";
import type { StorageRepository } from "./storage.types";

export async function readLocalBackupData(storage: StorageRepository): Promise<LocalBackupData> {
  const [storedBudgets, storedExpenses, storedCalculator, storedPlanner, storedWishTracker, storedSchedulePreferences] = await Promise.all([
    storage.get<unknown>(STORAGE_KEYS.budgets, {}),
    storage.get<unknown>(STORAGE_KEYS.expenses, []),
    storage.get<unknown>(STORAGE_KEYS.calculator, null),
    storage.get<unknown>(STORAGE_KEYS.planner, null),
    storage.get<unknown>(STORAGE_KEYS.wishTracker, null),
    storage.get<unknown>(STORAGE_KEYS.schedulePreferences, DEFAULT_SCHEDULE_PREFERENCES),
  ]);

  return {
    budgets: normalizeBudgetMap(storedBudgets),
    expenses: normalizeStoredExpenses(storedExpenses),
    calculator: storedCalculator === null ? null : normalizeCalculatorDraft(storedCalculator),
    planner: normalizePlannerState(storedPlanner),
    wishTracker: normalizeWishTrackerState(storedWishTracker),
    schedulePreferences: normalizeSchedulePreferences(storedSchedulePreferences),
  };
}

export function hasLocalBackupData(data: LocalBackupData): boolean {
  return Object.keys(data.budgets).length > 0
    || data.expenses.length > 0
    || data.calculator !== null
    || data.planner.goals.length > 0
    || data.planner.checkIns.length > 0
    || data.planner.monthlyIncome !== DEFAULT_PLANNER_STATE.monthlyIncome
    || data.wishTracker.records.length > 0
    || Object.values(data.wishTracker.guaranteeOverrides).some((value) => value !== null)
    || Object.values(data.wishTracker.currentPity).some((count) => count > 0)
    || (data.schedulePreferences !== null
      && data.schedulePreferences.selectedLeads.length !== DEFAULT_SCHEDULE_PREFERENCES.selectedLeads.length);
}

import { describe, expect, it } from "vitest";

import { restoreLocalBackup } from "@/data/repositories/backupRestore";
import { STORAGE_KEYS, type StorageRepository } from "@/data/repositories/storage.types";
import type { LocalBackupData } from "@/domain/backup";

function repository(initial: Record<string, unknown>, failOnceAt?: string) {
  const values = new Map(Object.entries(initial));
  const raw = new Map(Object.entries(initial).map(([key, value]) => [key, JSON.stringify(value)]));
  let failed = false;
  const storage: StorageRepository = {
    async get<T>(key: string, fallback: T) {
      return (raw.has(key) ? JSON.parse(raw.get(key) as string) : fallback) as T;
    },
    async set<T>(key: string, value: T) {
      if (!failed && key === failOnceAt) {
        failed = true;
        throw new Error("simulated storage failure");
      }
      values.set(key, value);
      raw.set(key, JSON.stringify(value));
    },
    async remove(key: string) {
      values.delete(key);
      raw.delete(key);
    },
    async getRaw(key: string) {
      return raw.get(key) ?? null;
    },
    async setRaw(key: string, value: string | null) {
      if (value === null) {
        raw.delete(key);
        values.delete(key);
        return;
      }
      raw.set(key, value);
      try {
        values.set(key, JSON.parse(value));
      } catch {
        values.set(key, value);
      }
    },
  };
  return { raw, storage, values };
}

const backup: LocalBackupData = {
  budgets: { "2026-08": { amount: 3000, threshold: 80 } },
  expenses: [{ id: 2, amt: 170, cat: "月卡/週卡", note: "月卡", date: "2026-08-14" }],
  calculator: null,
  planner: { monthlyIncome: 7060, goals: [], checkIns: [] },
  wishTracker: { currentPity: { 限定新池: 9, 復刻池: 0, 常駐池: 0 }, guaranteeOverrides: { 限定新池: null, 復刻池: null, 常駐池: null }, records: [] },
  schedulePreferences: { selectedLeads: ["秦徹"] },
};

describe("transactional backup restore", () => {
  it("writes the complete backup and clears obsolete transient data", async () => {
    const { storage, values } = repository({
      [STORAGE_KEYS.legacyBudget]: { amount: 1000, threshold: 80 },
      [STORAGE_KEYS.pendingExpense]: { amt: 15 },
      [STORAGE_KEYS.pendingPullGoal]: { title: "暫存排期" },
      [STORAGE_KEYS.pendingCalculatorTarget]: { pulls: 129 },
      [STORAGE_KEYS.schedulePreferences]: { selectedLeads: ["黎深"] },
      [STORAGE_KEYS.calculator]: { pool: "日卡池" },
    });

    await restoreLocalBackup(storage, backup);

    expect(values.get(STORAGE_KEYS.budgets)).toEqual(backup.budgets);
    expect(values.get(STORAGE_KEYS.expenses)).toEqual(backup.expenses);
    expect(values.has(STORAGE_KEYS.calculator)).toBe(false);
    expect(values.get(STORAGE_KEYS.planner)).toEqual(backup.planner);
    expect(values.get(STORAGE_KEYS.wishTracker)).toEqual(backup.wishTracker);
    expect(values.has(STORAGE_KEYS.legacyBudget)).toBe(false);
    expect(values.has(STORAGE_KEYS.pendingExpense)).toBe(false);
    expect(values.has(STORAGE_KEYS.pendingPullGoal)).toBe(false);
    expect(values.has(STORAGE_KEYS.pendingCalculatorTarget)).toBe(false);
    expect(values.get(STORAGE_KEYS.schedulePreferences)).toEqual(backup.schedulePreferences);
  });

  it("rolls every key back when one write fails", async () => {
    const previous = {
      [STORAGE_KEYS.budgets]: { "2026-08": { amount: 1200, threshold: 70 } },
      [STORAGE_KEYS.expenses]: [{ id: 1, amt: 30 }],
      [STORAGE_KEYS.calculator]: { pool: "混池" },
      [STORAGE_KEYS.legacyBudget]: { amount: 900 },
      [STORAGE_KEYS.pendingExpense]: { amt: 150 },
      [STORAGE_KEYS.schedulePreferences]: { selectedLeads: ["秦徹"] },
    };
    const { storage, values } = repository(previous, STORAGE_KEYS.expenses);

    await expect(restoreLocalBackup(storage, backup)).rejects.toThrow("原本的資料已保留");
    expect(Object.fromEntries(values)).toEqual(previous);
  });

  it("rolls core data back when the new schedule-preference write fails", async () => {
    const previous = {
      [STORAGE_KEYS.budgets]: { "2026-08": { amount: 1200, threshold: 70 } },
      [STORAGE_KEYS.expenses]: [{ id: 1, amt: 30 }],
      [STORAGE_KEYS.schedulePreferences]: { selectedLeads: ["黎深"] },
    };
    const { storage, values } = repository(previous, STORAGE_KEYS.schedulePreferences);

    await expect(restoreLocalBackup(storage, backup)).rejects.toThrow("原本的資料已保留");

    expect(Object.fromEntries(values)).toEqual(previous);
  });

  it("preserves current schedule preferences when restoring a legacy snapshot", async () => {
    const { storage, values } = repository({
      [STORAGE_KEYS.schedulePreferences]: { selectedLeads: ["黎深"] },
    });

    await restoreLocalBackup(storage, { ...backup, schedulePreferences: null });

    expect(values.get(STORAGE_KEYS.schedulePreferences)).toEqual({ selectedLeads: ["黎深"] });
  });

  it("restores over corrupt JSON while preserving the raw value if a later write fails", async () => {
    const first = repository({ [STORAGE_KEYS.wishTracker]: {} });
    first.raw.set(STORAGE_KEYS.wishTracker, "{broken-json");

    await restoreLocalBackup(first.storage, backup);

    expect(first.values.get(STORAGE_KEYS.wishTracker)).toEqual(backup.wishTracker);

    const second = repository({ [STORAGE_KEYS.wishTracker]: {} }, STORAGE_KEYS.schedulePreferences);
    second.raw.set(STORAGE_KEYS.wishTracker, "{broken-json");
    await expect(restoreLocalBackup(second.storage, backup)).rejects.toThrow("原本的資料已保留");
    expect(second.raw.get(STORAGE_KEYS.wishTracker)).toBe("{broken-json");
  });
});

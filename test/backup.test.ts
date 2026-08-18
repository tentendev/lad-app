import { describe, expect, it } from "vitest";

import { hasLocalBackupData } from "@/data/repositories/localBackupData";
import { createLocalBackup, parseLocalBackup, validateLocalBackupData } from "@/domain/backup";
import type { LocalBackupData } from "@/domain/backup";

describe("local backup", () => {
  it("round-trips budgets, expenses, and calculator settings", () => {
    const data = {
      budgets: { "2026-08": { amount: 3000, threshold: 80 } },
      expenses: [{ id: 1, amt: 170, cat: "月卡/週卡" as const, note: "月卡", date: "2026-08-14" }],
      calculator: { pool: "日卡池" as const, cur: 1500, tickets: 2, pulls: 40, reserve: 10, reserveUnit: "pulls" as const },
      planner: { monthlyIncome: 7060, goals: [{ id: 3, title: "生日池", pool: "生日池" as const, targetPulls: 80, deadline: "2026-09-07", tentative: true, enabled: true, sourceEvent: null }], checkIns: [{ id: 9, date: "2026-08-14", diamonds: 1500, tickets: 2, note: "起點" }] },
      wishTracker: { currentPity: { 限定新池: 12, 復刻池: 0, 常駐池: 3 }, guaranteeOverrides: { 限定新池: true, 復刻池: null, 常駐池: null }, records: [{ id: 4, track: "限定新池" as const, pity: 63, date: "2026-08-13", memory: "卡 A", outcome: "當期UP" as const }] },
      schedulePreferences: { selectedLeads: ["黎深" as const, "秦徹" as const] },
    };

    const backup = createLocalBackup(data, "2026-08-14T00:00:00.000Z");
    expect(parseLocalBackup(JSON.stringify(backup))).toEqual(data);
  });

  it("rejects unknown files and unsafe values", () => {
    expect(() => parseLocalBackup("not json")).toThrow("無法讀取備份檔");
    expect(() => parseLocalBackup(JSON.stringify({ product: "other", version: 1, data: {} }))).toThrow("不是支援");

    const backup = createLocalBackup({
      budgets: { "2026-08": { amount: -1, threshold: 80 } },
      expenses: [],
      calculator: null,
      planner: { monthlyIncome: 7060, goals: [], checkIns: [] },
      wishTracker: { currentPity: { 限定新池: 0, 復刻池: 0, 常駐池: 0 }, guaranteeOverrides: { 限定新池: null, 復刻池: null, 常駐池: null }, records: [] },
      schedulePreferences: { selectedLeads: ["黎深"] },
    });
    expect(() => parseLocalBackup(JSON.stringify(backup))).toThrow("預算金額");

    const unsafe = createLocalBackup({ ...backup.data, budgets: { "2026-08": { amount: 1e100, threshold: 80 } } });
    expect(() => parseLocalBackup(JSON.stringify(unsafe))).toThrow("預算金額");
  });

  it("validates the unwrapped cloud snapshot payload", () => {
    const data = {
      budgets: {},
      expenses: [],
      calculator: null,
      planner: { monthlyIncome: 7060, goals: [], checkIns: [] },
      wishTracker: { currentPity: { 限定新池: 0, 復刻池: 0, 常駐池: 0 }, guaranteeOverrides: { 限定新池: null, 復刻池: null, 常駐池: null }, records: [] },
      schedulePreferences: { selectedLeads: ["沈星回", "黎深", "祁煜", "秦徹", "夏以晝"] },
    };
    expect(validateLocalBackupData(data)).toEqual(data);
    expect(() => validateLocalBackupData({ ...data, expenses: "not-an-array" })).toThrow("花費資料格式");
  });

  it("migrates older backups and cloud snapshots without newer feature data", () => {
    const legacy = {
      product: "deep-space-ledger",
      version: 1,
      exportedAt: "2026-08-14T00:00:00.000Z",
      data: { budgets: {}, expenses: [], calculator: null },
    };
    expect(parseLocalBackup(JSON.stringify(legacy)).planner).toEqual({ monthlyIncome: 7060, goals: [], checkIns: [] });
    expect(validateLocalBackupData(legacy.data).planner).toEqual({ monthlyIncome: 7060, goals: [], checkIns: [] });
    expect(parseLocalBackup(JSON.stringify(legacy)).wishTracker).toEqual({ currentPity: { 限定新池: 0, 復刻池: 0, 常駐池: 0 }, guaranteeOverrides: { 限定新池: null, 復刻池: null, 常駐池: null }, records: [] });
    expect(parseLocalBackup(JSON.stringify(legacy)).schedulePreferences).toBeNull();

    const version2 = { ...legacy, version: 2, data: { ...legacy.data, planner: { monthlyIncome: 7060, goals: [] } } };
    expect(parseLocalBackup(JSON.stringify(version2)).wishTracker.records).toEqual([]);

    const legacyExpense = {
      ...legacy,
      data: {
        ...legacy.data,
        expenses: [{ id: 1, amt: 150, cat: "抽卡", date: "2026-08-14" }],
      },
    };
    expect(parseLocalBackup(JSON.stringify(legacyExpense)).expenses).toEqual([
      { id: 1, amt: 150, cat: "抽卡禮包", note: "", date: "2026-08-14" },
    ]);
  });

  it("treats check-ins and customized planner income as backup-worthy data", () => {
    const empty: LocalBackupData = {
      budgets: {},
      expenses: [],
      calculator: null,
      planner: { monthlyIncome: 7060, goals: [], checkIns: [] },
      wishTracker: { currentPity: { 限定新池: 0, 復刻池: 0, 常駐池: 0 }, guaranteeOverrides: { 限定新池: null, 復刻池: null, 常駐池: null }, records: [] },
      schedulePreferences: { selectedLeads: ["沈星回", "黎深", "祁煜", "秦徹", "夏以晝"] },
    };
    expect(hasLocalBackupData(empty)).toBe(false);
    expect(hasLocalBackupData({
      ...empty,
      planner: { ...empty.planner, checkIns: [{ id: 1, date: "2026-08-19", diamonds: 1500, tickets: 3, note: "今日" }] },
    })).toBe(true);
    expect(hasLocalBackupData({ ...empty, planner: { ...empty.planner, monthlyIncome: 3000 } })).toBe(true);
    expect(hasLocalBackupData({
      ...empty,
      wishTracker: { ...empty.wishTracker, guaranteeOverrides: { ...empty.wishTracker.guaranteeOverrides, 限定新池: true } },
    })).toBe(true);
    expect(hasLocalBackupData({ ...empty, schedulePreferences: { selectedLeads: ["黎深"] } })).toBe(true);
  });
});

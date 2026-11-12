import { readFileSync } from "node:fs";
import vm from "node:vm";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getPackTiers, PACK_DATA } from "@/data/packs";
import { calculateResources, DEFAULT_CALCULATOR_DRAFT, normalizeCalculatorDraft, officialTicketCount, recommendPacks, summarizeSelectedPacks } from "@/domain/calculator";
import { budgetKey, expensesForMonth, normalizeBudgetMap, normalizeStoredExpenses, summarizeBudget, summarizeSpendingRange } from "@/domain/budget";
import { createLocalBackup, parseLocalBackup, validateLocalBackupData } from "@/domain/backup";
import { isLocalPreview } from "@/auth/localPreview";
import { CALCULATOR_POOLS, CURRENCIES, POOLS, type Currency, type Pool, type RegionalPackTier } from "@/domain/types";

describe("current HTML data and native calculation parity", () => {
  it("offers event pools while safely reading retired calculator choices without dropping resources", () => {
    expect(CALCULATOR_POOLS).not.toContain("協會補給");
    expect(CALCULATOR_POOLS).not.toContain("其他");
    for (const pool of ["協會補給", "其他"]) {
      const data = validateLocalBackupData({ budgets: {}, expenses: [], calculator: { ...DEFAULT_CALCULATOR_DRAFT, pool, cur: 12600, tickets: 16, pulls: 140 } });
      expect(data.calculator).toMatchObject({ pool: "日卡池", cur: 12600, tickets: 16, pulls: 140 });
    }
  });
  it("uses identical regional prices, evidence status, quantities and cumulative totals in all supported pools", () => {
    const context = { window: {} as { getPackTiers: (pool: Pool, currency: Currency) => RegionalPackTier[] } };
    for (const name of ["regional-prices.js", "packs.js"]) vm.runInNewContext(readFileSync(new URL(`../${name}`, import.meta.url), "utf8"), context);
    for (const pool of POOLS) for (const currency of CURRENCIES) {
      expect(getPackTiers(pool, currency), `${pool}/${currency}`).toEqual(context.window.getPackTiers(pool, currency));
    }
  });

  it("separates monthly, birthday and mixed rerun rewards and purchase limits", () => {
    expect(officialTicketCount("月卡復刻池", 10)).toBe(0);
    expect(officialTicketCount("月卡復刻池", 11)).toBe(1);
    expect(officialTicketCount("月卡復刻池", 105)).toBe(20);
    expect(officialTicketCount("生日復刻池", 300)).toBe(0);
    expect(officialTicketCount("混池復刻池", 155)).toBe(15);
    expect(PACK_DATA["生日復刻池"].at(-1)?.cumPulls).toBe(254);
    expect(PACK_DATA["混池復刻池"].at(-1)?.cumPulls).toBe(302);
  });

  it("keeps a manual zero ticket override per pool and preserves resources when changing currencies", () => {
    const draft = normalizeCalculatorDraft({ ...DEFAULT_CALCULATOR_DRAFT, pool: "混池復刻池", pulls: 155, reserve: 20, officialTicketsByPool: { 混池復刻池: 0 } });
    expect(calculateResources(draft)).toMatchObject({ officialTickets: 0, gapDia: 26250 });
    const automatic = { ...draft, officialTicketsByPool: {} };
    expect(calculateResources(automatic)).toMatchObject({ officialTickets: 15, gapDia: 24000 });
    expect(recommendPacks({ ...automatic, currency: "MYR" }).planCost).toBeGreaterThan(0);
    expect(calculateResources({ ...draft, currency: "MYR" })).toEqual(calculateResources(draft));
  });

  it("migrates both legacy rerun names without overwriting a newer birthday selection", () => {
    const result = normalizeCalculatorDraft({ ...DEFAULT_CALCULATOR_DRAFT, pool: "復刻池", officialTicketsByPool: { 復刻池: 0 }, packQuantities: { 復刻池: [99, 99], 生日復刻池: [0, 1] } });
    expect(result.pool).toBe("生日復刻池");
    expect(result.officialTicketsByPool).toEqual({ 生日復刻池: 0 });
    expect(result.packQuantities?.生日復刻池).toEqual([0, 1, 0, 0, 0]);
    expect(summarizeSelectedPacks({ ...result, currency: "MYR" })).toMatchObject({ cost: 22.9, count: 1, estimatedPrices: false });
  });
});

describe("currency-safe wallet and backup", () => {
  const expenses = normalizeStoredExpenses([
    { id: 1, amt: 320, date: "2026-11-04", cat: "抽卡禮包", note: "legacy TWD" },
    { id: 2, amt: 4.9, currency: "MYR", date: "2026-11-04", cat: "抽卡禮包", note: "" },
    { id: 3, amt: 8, currency: "HKD", date: "2026-11-04", cat: "其他", note: "" },
  ]);
  it("keeps legacy Taiwan records while filtering every monthly total and chart by currency", () => {
    expect(expensesForMonth(expenses, "2026-11")).toHaveLength(1);
    expect(summarizeBudget({ amount: 99.9, threshold: 80 }, expenses, "MYR")).toMatchObject({ spent: 4.9, remaining: 95 });
    expect(summarizeSpendingRange(expenses, "2026-06", "2026-11", "MYR")).toMatchObject({ total: 4.9, average: 0.82 });
    expect(budgetKey("2026-11", "TWD")).toBe("2026-11");
    expect(budgetKey("2026-11", "MYR")).toBe("MYR:2026-11");
  });
  it("round-trips currency, independent budgets, manual tickets, and migrated pools through backup validation", () => {
    const data = validateLocalBackupData({ budgets: normalizeBudgetMap({ "2026-11": { amount: 3000, threshold: 80 }, "MYR:2026-11": { amount: 99.9, threshold: 75 } }), expenses, calculator: { ...DEFAULT_CALCULATOR_DRAFT, pool: "復刻池", currency: "MYR", officialTicketsByPool: { 復刻池: 0 } } });
    expect(parseLocalBackup(JSON.stringify(createLocalBackup(data)))).toEqual(data);
    expect(data.calculator).toMatchObject({ pool: "生日復刻池", currency: "MYR", officialTicketsByPool: { 生日復刻池: 0 } });
    expect(() => normalizeStoredExpenses([{ ...expenses[0], currency: "USD" }])).toThrow("currency");
  });
});

describe("local preview boundary", () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
  it("requires an explicit development flag and remains disabled in production", () => {
    vi.stubEnv("EXPO_PUBLIC_LOCAL_PREVIEW", "true");
    vi.stubGlobal("__DEV__", true);
    expect(isLocalPreview()).toBe(true);
    vi.stubGlobal("__DEV__", false);
    expect(isLocalPreview()).toBe(false);
    vi.stubGlobal("__DEV__", true);
    vi.stubEnv("EXPO_PUBLIC_LOCAL_PREVIEW", "false");
    expect(isLocalPreview()).toBe(false);
  });
});

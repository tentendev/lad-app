import { describe, expect, it } from "vitest";

import { expensesForMonth, expensesToCsv, migrateExpense, nextExpenseId, normalizeBudgetConfig, normalizeBudgetMap, normalizeExpenseDraft, normalizePendingExpense, normalizeStoredExpenses, summarizeBudget, summarizeBudgetPace, summarizeSpendingInsights } from "@/domain/budget";

describe("summarizeBudget", () => {
  it("returns warning at the configured threshold", () => {
    const result = summarizeBudget(
      { amount: 3000, threshold: 80 },
      [{ id: 1, amt: 2400, cat: "抽卡禮包", note: "", date: "2026-08-13" }],
    );
    expect(result.percentage).toBe(80);
    expect(result.state).toBe("warning");
  });

  it("keeps overspend as a negative remaining amount", () => {
    const result = summarizeBudget(
      { amount: 1000, threshold: 80 },
      [{ id: 1, amt: 1200, cat: "其他", note: "", date: "2026-08-13" }],
    );
    expect(result.remaining).toBe(-200);
    expect(result.state).toBe("over");
  });

  it("migrates legacy category names", () => {
    const migrated = migrateExpense({ id: 1, amt: 100, cat: "抽卡" as never, note: "", date: "2026-08-13" });
    expect(migrated.cat).toBe("抽卡禮包");
  });

  it("validates and migrates the raw local expense collection", () => {
    expect(normalizeStoredExpenses([
      { id: 1, amt: 100, cat: "抽卡", note: "  限定  ", date: "2026-08-14" },
    ])).toEqual([
      { id: 1, amt: 100, cat: "抽卡禮包", note: "限定", date: "2026-08-14" },
    ]);
    expect(() => normalizeStoredExpenses([{ id: 1, amt: 100, cat: "其他", date: "2026-99-99" }])).toThrow();
    expect(() => normalizeStoredExpenses([{ id: 1, amt: 100, cat: "其他", date: "2026-08-14" }, { id: 1, amt: 20, cat: "其他", date: "2026-08-15" }])).toThrow();
    expect(() => normalizeStoredExpenses([{ id: 1.5, amt: 100, cat: "其他", date: "2026-08-14" }])).toThrow();
    expect(() => normalizeStoredExpenses([{ id: -1, amt: 100, cat: "其他", date: "2026-08-14" }])).toThrow();
    expect(() => normalizeStoredExpenses([{ id: 2, amt: 1e100, cat: "其他", date: "2026-08-14" }])).toThrow();
  });

  it("rejects impossible stored budget keys before rendering", () => {
    expect(normalizeBudgetMap({ "2026-08": { amount: 3000, threshold: 80 } })).toEqual({ "2026-08": { amount: 3000, threshold: 80 } });
    expect(() => normalizeBudgetMap({ "2026-13": { amount: 3000, threshold: 80 } })).toThrow();
    expect(() => normalizeBudgetMap({ "2026-08": { amount: 1e100, threshold: 80 } })).toThrow();
  });

  it("falls back from corrupt legacy budgets and pending handoffs", () => {
    expect(normalizeBudgetConfig({ amount: "3000", threshold: 80 }, { amount: 0, threshold: 80 })).toEqual({ amount: 0, threshold: 80 });
    expect(normalizePendingExpense({ amt: 525, cat: "抽卡", date: "2026-08-14" })).toEqual({ amt: 525, cat: "抽卡禮包", note: "", date: "2026-08-14" });
    expect(normalizePendingExpense({ amt: 525, cat: "抽卡", note: "  一階  ", date: "2026-08-14" })?.note).toBe("一階");
    expect(normalizePendingExpense({ amt: 525, cat: "抽卡", date: "2026-18-14" })).toBeNull();
  });

  it("validates every new or edited expense at the domain boundary", () => {
    expect(normalizeExpenseDraft({ amt: 150, cat: "抽卡", note: "  限定  ", date: "2026-08-14" }))
      .toEqual({ amt: 150, cat: "抽卡禮包", note: "限定", date: "2026-08-14" });
    expect(normalizeExpenseDraft({ amt: 0, cat: "其他", note: "", date: "2026-08-14" })).toBeNull();
    expect(normalizeExpenseDraft({ amt: 150, cat: "其他", note: "", date: "2026-02-29" })).toBeNull();
    expect(normalizeExpenseDraft({ amt: 1e100, cat: "其他", note: "", date: "2026-08-14" })).toBeNull();
  });

  it("allocates unique monotonic expense ids even within the same millisecond", () => {
    const expenses = [{ id: 2_000, amt: 10, cat: "其他" as const, note: "", date: "2026-08-14" }];
    const first = nextExpenseId(expenses, 0, 1_000);
    const second = nextExpenseId(expenses, first, 1_000);
    expect(first).toBe(2_001);
    expect(second).toBe(2_002);
  });

  it("exports selected expenses in stable spreadsheet-safe order", () => {
    const csv = expensesToCsv([
      { id: 1, amt: 200, cat: "其他", note: '卡 "套組"', date: "2026-08-01" },
      { id: 2, amt: 150, cat: "抽卡禮包", note: "限定,一階", date: "2026-08-05" },
    ]);
    expect(csv.split("\n")[0]).toBe('"date","amount_twd","category","note"');
    expect(csv.split("\n")[1]).toContain('"2026-08-05","150","抽卡禮包","限定,一階"');
    expect(csv).toContain('"卡 ""套組"""');
    expect(expensesToCsv([{ id: 3, amt: 1, cat: "其他", note: "=2+2", date: "2026-08-06" }]))
      .toContain('"\'=2+2"');
  });

  it("keeps an edited month's visible history in reverse chronological order", () => {
    const expenses = [
      { id: 3, amt: 20, cat: "其他" as const, note: "較早建立", date: "2026-08-01" },
      { id: 1, amt: 10, cat: "其他" as const, note: "同日舊筆", date: "2026-08-10" },
      { id: 2, amt: 30, cat: "其他" as const, note: "同日新筆", date: "2026-08-10" },
      { id: 4, amt: 40, cat: "其他" as const, note: "別月", date: "2026-07-31" },
    ];
    expect(expensesForMonth(expenses, "2026-08").map((expense) => expense.id)).toEqual([2, 1, 3]);
  });

  it("builds category, comparison, trend, and current-month projections", () => {
    const insights = summarizeSpendingInsights([
      { id: 1, amt: 600, cat: "抽卡禮包", note: "", date: "2026-08-05" },
      { id: 2, amt: 200, cat: "月卡/週卡", note: "", date: "2026-08-10" },
      { id: 3, amt: 400, cat: "抽卡禮包", note: "", date: "2026-07-20" },
      { id: 4, amt: 100, cat: "其他", note: "", date: "2026-03-01" },
    ], "2026-08", new Date(2026, 7, 20));

    expect(insights.categories).toEqual([
      { category: "抽卡禮包", amount: 600, percentage: 75 },
      { category: "月卡/週卡", amount: 200, percentage: 25 },
    ]);
    expect(insights.previousSpent).toBe(400);
    expect(insights.changeAmount).toBe(400);
    expect(insights.changePercentage).toBe(100);
    expect(insights.projectedMonthEnd).toBe(1240);
    expect(insights.months).toEqual([
      { month: "2026-03", amount: 100 },
      { month: "2026-04", amount: 0 },
      { month: "2026-05", amount: 0 },
      { month: "2026-06", amount: 0 },
      { month: "2026-07", amount: 400 },
      { month: "2026-08", amount: 800 },
    ]);
  });

  it("does not invent a percentage comparison or projection when no baseline applies", () => {
    const insights = summarizeSpendingInsights([
      { id: 1, amt: 200, cat: "其他", note: "", date: "2026-05-01" },
    ], "2026-05", new Date(2026, 7, 20));
    expect(insights.changePercentage).toBeNull();
    expect(insights.projectedMonthEnd).toBeNull();
  });

  it("does not treat a future-dated planned expense as past daily spending", () => {
    const insights = summarizeSpendingInsights([
      { id: 1, amt: 800, cat: "抽卡禮包", note: "已花", date: "2026-08-10" },
      { id: 2, amt: 1000, cat: "其他", note: "月底預定", date: "2026-08-25" },
    ], "2026-08", new Date(2026, 7, 20));
    expect(insights.projectedMonthEnd).toBe(1800);
  });

  it("turns the current-month projection into a daily flexible-spend decision", () => {
    const now = new Date(2026, 7, 20);
    expect(summarizeBudgetPace(
      { budget: 1000, spent: 800, remaining: 200, percentage: 80, threshold: 80, state: "warning" },
      1240,
      "2026-08",
      now,
    )).toEqual({
      status: "projected-over",
      daysRemaining: 12,
      dailyFlexibleSpend: 16,
      projectedVariance: -240,
    });
    expect(summarizeBudgetPace(
      { budget: 2000, spent: 800, remaining: 1200, percentage: 40, threshold: 80, state: "healthy" },
      1240,
      "2026-08",
      now,
    )).toEqual({
      status: "on-track",
      daysRemaining: 12,
      dailyFlexibleSpend: 100,
      projectedVariance: 760,
    });
  });

  it("withholds a live pace from historical or unset budgets", () => {
    const summary = { budget: 1000, spent: 200, remaining: 800, percentage: 20, threshold: 80, state: "healthy" as const };
    expect(summarizeBudgetPace(summary, 400, "2026-07", new Date(2026, 7, 20)).status).toBe("unavailable");
    expect(summarizeBudgetPace({ ...summary, budget: 0 }, 400, "2026-08", new Date(2026, 7, 20)).status).toBe("unavailable");
  });
});

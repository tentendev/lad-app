import { readFileSync } from "node:fs";
import vm from "node:vm";
import { describe, expect, it } from "vitest";
import { SCHEDULE, SCHEDULE_META } from "@/data/schedule";
import { DEFAULT_CALCULATOR_DRAFT, normalizeCalculatorDraft, selectedPackQuantities, summarizeSelectedPacks } from "@/domain/calculator";
import { spendingRangeError, summarizeSpendingRange } from "@/domain/budget";
import { eventStatus, eventsForDate, scheduleEventToIcs } from "@/domain/schedule";
import { validateLocalBackupData } from "@/domain/backup";

const draft = { ...DEFAULT_CALCULATOR_DRAFT, pool: "日卡池" as const, pulls: 70 };

describe("upstream HTML feature parity", () => {
  it("ships the same schedule as the HTML source, including provenance", () => {
    const context = { window: {} as Record<string, unknown> };
    vm.runInNewContext(readFileSync(new URL("../schedule.js", import.meta.url), "utf8"), context);
    expect(SCHEDULE).toEqual(context.window.SCHEDULE);
    expect(SCHEDULE_META).toEqual(context.window.SCHEDULE_META);
  });
  it("exports only the opening day when the end date is unknown", () => {
    const event = SCHEDULE.find((item) => !item.end)!;
    const ics = scheduleEventToIcs(event).replaceAll("\r\n ", "");
    expect(ics).toContain("DTEND;VALUE=DATE:20261022");
    expect(ics).toContain("結束日待確認");
    expect(ics).not.toContain("NaN");
    expect(eventStatus(event, "2026-10-22").label).toBe("結束日待確認");
    expect(eventsForDate([event], "2026-10-21")).toHaveLength(1);
    expect(eventsForDate([event], "2026-10-22")).toHaveLength(0);
  });
  it("starts with recommended quantities and computes manual cost separately", () => {
    expect(selectedPackQuantities(draft)).toEqual([5, 5, 5, 1, 0, 0, 0]);
    const result = summarizeSelectedPacks({ ...draft, packQuantities: { 日卡池: [1, 2, 0, 0, 0, 0, 0] } });
    expect(result).toMatchObject({ cost: 75, pulls: 5, count: 3, missingPulls: 49, unknownPulls: false });
    expect(result.items).toEqual(["第一階 1包", "第二階 2包"]);
  });
  it("bounds invalid saved quantities and keeps manual plans per pool", () => {
    const normalized = normalizeCalculatorDraft({ ...draft, packQuantities: { 日卡池: [999, -3, 2.8, "bad"], 復刻池: [1] } });
    expect(selectedPackQuantities(normalized)).toEqual([5, 0, 2, 0, 0, 0, 0]);
    expect(selectedPackQuantities({ ...normalized, pool: "復刻池" })).toEqual([1, 0, 0, 0, 0]);
    expect(selectedPackQuantities({ ...draft, packQuantities: { 日卡池: [] } })).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });
  it("does not invent pull counts for nonfixed packs", () => {
    const result = summarizeSelectedPacks({ ...draft, pool: "月卡池", packQuantities: { 月卡池: [0, 0, 0, 0, 0, 0, 1] } });
    expect(result).toMatchObject({ cost: 1490, pulls: 0, count: 1, unknownPulls: true });
    expect(result.missingPulls).toBeGreaterThan(0);
  });
  it("keeps manual pack quantities through backup validation", () => {
    const calculator = { ...draft, packQuantities: { 日卡池: [1, 2, 0, 0, 0, 0, 0] } };
    const result = validateLocalBackupData({ budgets: {}, expenses: [], calculator });
    expect(result.calculator).toEqual(calculator);
  });
  it("includes zero months and year boundaries in chart totals", () => {
    const result = summarizeSpendingRange([
      { id: 1, amt: 200, date: "2025-12-31", cat: "其他", note: "" },
      { id: 2, amt: 400, date: "2026-02-01", cat: "其他", note: "" },
      { id: 3, amt: 999, date: "2026-03-01", cat: "其他", note: "outside" },
    ], "2025-12", "2026-02");
    expect(result).toMatchObject({ total: 600, average: 200, highest: { month: "2026-02", amount: 400 } });
    expect(result.months[1]).toEqual({ month: "2026-01", amount: 0 });
  });
  it("rejects reversed, invalid, and overlong ranges without unbounded loops", () => {
    expect(spendingRangeError("2026-04", "2026-03")).toContain("不能早於");
    expect(spendingRangeError("2026-00", "2026-03")).toContain("有效");
    expect(spendingRangeError("2020-01", "2025-01")).toContain("60");
    expect(spendingRangeError("2020-01", "2024-12")).toBeNull();
    expect(summarizeSpendingRange([], "2026-09", "2026-09")).toMatchObject({ total: 0, average: 0 });
  });
});

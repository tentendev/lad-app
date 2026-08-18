import { describe, expect, it } from "vitest";

import { adjustedPityCount, featuredTargetPulls, nextFeaturedGuarantee, nextFiveStarRecordId, normalizeFiveStarRecordDraft, normalizeWishTrackerState, resolvedFeaturedGuarantee, wishRecordsToCsv, wishStatistics } from "@/domain/wishTracker";

describe("wish tracker", () => {
  const records = [
    { id: 1, track: "限定新池" as const, pity: 63, date: "2026-08-01", memory: "卡 A", outcome: "當期UP" as const },
    { id: 2, track: "限定新池" as const, pity: 70, date: "2026-08-10", memory: "卡 B", outcome: "非當期" as const },
    { id: 3, track: "復刻池" as const, pity: 20, date: "2026-08-12", memory: "", outcome: "未標記" as const },
  ];

  it("normalizes strict local tracker data", () => {
    expect(normalizeWishTrackerState({
      currentPity: { 限定新池: 12, 復刻池: 4, 常駐池: 0 },
      records,
    })).toEqual({ currentPity: { 限定新池: 12, 復刻池: 4, 常駐池: 0 }, guaranteeOverrides: { 限定新池: null, 復刻池: null, 常駐池: null }, records });
    expect(normalizeWishTrackerState(null).records).toEqual([]);
    expect(() => normalizeWishTrackerState({ currentPity: { 限定新池: -1 }, records: [] })).toThrow();
    expect(() => normalizeWishTrackerState({ currentPity: { 限定新池: 0, 復刻池: 0, 常駐池: 0 }, records: [records[0], records[0]] })).toThrow();
    expect(normalizeWishTrackerState({
      currentPity: { 限定新池: 0, 復刻池: 0, 常駐池: 0 },
      guaranteeOverrides: { 限定新池: true, 復刻池: false, 常駐池: true },
      records: [{ ...records[0], id: 1_787_080_000_000 }],
    })).toMatchObject({
      guaranteeOverrides: { 限定新池: true, 復刻池: false, 常駐池: null },
      records: [{ id: 1_787_080_000_000 }],
    });
    expect(() => normalizeWishTrackerState({
      currentPity: { 限定新池: 0, 復刻池: 0, 常駐池: 0 },
      guaranteeOverrides: { 限定新池: "yes", 復刻池: null, 常駐池: null },
      records: [],
    })).toThrow("guarantee override");
  });

  it("validates and trims record drafts", () => {
    expect(normalizeFiveStarRecordDraft({ track: "限定新池", pity: 63, date: "2026-08-01", memory: "  卡 A  ", outcome: "當期UP" }))
      .toEqual({ track: "限定新池", pity: 63, date: "2026-08-01", memory: "卡 A", outcome: "當期UP" });
    expect(normalizeFiveStarRecordDraft({ track: "限定新池", pity: 0, date: "2026-08-01", memory: "", outcome: "未標記" })).toBeNull();
  });

  it("summarizes pity and only uses known outcomes for the featured rate", () => {
    expect(wishStatistics(records)).toEqual({
      count: 3,
      averagePity: 51,
      earliestPity: 20,
      latestPity: 70,
      featuredRate: 50,
      knownOutcomes: 2,
    });
    expect(wishStatistics(records, "限定新池").averagePity).toBe(66.5);
    expect(wishStatistics([], null).featuredRate).toBeNull();
  });

  it("derives the next featured guarantee only from the latest applicable record", () => {
    expect(nextFeaturedGuarantee(records, "限定新池")).toBe(true);
    expect(nextFeaturedGuarantee(records, "復刻池")).toBeNull();
    expect(nextFeaturedGuarantee(records, "常駐池")).toBeNull();
    expect(nextFeaturedGuarantee([...records, { id: 4, track: "限定新池", pity: 5, date: "2026-08-11", memory: "", outcome: "未標記" }], "限定新池")).toBeNull();
    expect(resolvedFeaturedGuarantee(records, { 限定新池: false, 復刻池: true, 常駐池: true }, "限定新池")).toBe(false);
    expect(resolvedFeaturedGuarantee(records, { 限定新池: null, 復刻池: true, 常駐池: true }, "限定新池")).toBe(true);
    expect(resolvedFeaturedGuarantee(records, { 限定新池: true, 復刻池: true, 常駐池: true }, "常駐池")).toBeNull();
  });

  it("allocates monotonic ids and exports spreadsheet-safe CSV", () => {
    expect(nextFiveStarRecordId(records, 5, 4)).toBe(6);
    expect(wishRecordsToCsv([{ ...records[0], memory: '卡 "A"' }])).toContain('"卡 ""A"""');
  });

  it("increments high-frequency pity counts without leaving the stored range", () => {
    expect(adjustedPityCount(12, 1)).toBe(13);
    expect(adjustedPityCount(12, -1)).toBe(11);
    expect(adjustedPityCount(995, 10)).toBe(999);
    expect(adjustedPityCount(0, -1)).toBe(0);
  });

  it("turns the saved pity line and guarantee state into conservative calculator targets", () => {
    expect(featuredTargetPulls(11, true, "限定新池")).toEqual({ nextFiveStarPulls: 59, featuredPulls: 59, conservative: false });
    expect(featuredTargetPulls(11, false, "限定新池")).toEqual({ nextFiveStarPulls: 59, featuredPulls: 129, conservative: true });
    expect(featuredTargetPulls(11, null, "復刻池")).toEqual({ nextFiveStarPulls: 59, featuredPulls: 129, conservative: true });
    expect(featuredTargetPulls(999, null, "常駐池")).toEqual({ nextFiveStarPulls: 0, featuredPulls: null, conservative: false });
  });
});

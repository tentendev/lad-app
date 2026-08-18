import { describe, expect, it } from "vitest";

import { calculateResources, normalizeCalculatorDraft, normalizePendingCalculatorTarget, officialTicketCount, recommendPacks, recommendPacksForGap } from "@/domain/calculator";
import { PACK_DATA } from "@/data/packs";
import { POOLS, type CalculatorDraft } from "@/domain/types";

const base: CalculatorDraft = {
  pool: "混池",
  cur: 0,
  tickets: 0,
  pulls: 0,
  reserve: 0,
  reserveUnit: "pulls",
};

describe("officialTicketCount", () => {
  it("does not use a milestone reward earned exactly at the target", () => {
    expect(officialTicketCount("混池", 50)).toBe(10);
    expect(officialTicketCount("混池", 51)).toBe(15);
  });

  it("caps repeating daily-pool rewards", () => {
    expect(officialTicketCount("日卡池", 1000)).toBe(20);
  });
});

describe("normalizeCalculatorDraft", () => {
  it("repairs corrupt storage values before rendering pack data", () => {
    expect(normalizeCalculatorDraft({
      pool: "不存在的卡池",
      cur: Number.POSITIVE_INFINITY,
      tickets: -2,
      pulls: 40,
      reserve: "10",
      reserveUnit: "unknown",
    })).toEqual({
      pool: "日卡池",
      cur: 0,
      tickets: 0,
      pulls: 40,
      reserve: 0,
      reserveUnit: "pulls",
    });
  });

  it("migrates indivisible diamonds, tickets, and wishes to whole counts", () => {
    expect(normalizeCalculatorDraft({ ...base, cur: 1500.9, tickets: 2.8, pulls: 40.5, reserve: 1.5 }))
      .toMatchObject({ cur: 1500, tickets: 2, pulls: 40, reserve: 1.5 });
  });
});

describe("normalizePendingCalculatorTarget", () => {
  it("accepts a tracker handoff and rejects ambiguous targets", () => {
    expect(normalizePendingCalculatorTarget({ pulls: 129, pool: "復刻池", source: " 復刻池保底 " }))
      .toEqual({ pulls: 129, pool: "復刻池", source: "復刻池保底" });
    expect(normalizePendingCalculatorTarget({ pulls: 0, pool: null, source: "限定新池" })).toBeNull();
    expect(normalizePendingCalculatorTarget({ pulls: 70, pool: "不存在", source: "限定新池" })).toBeNull();
  });
});

describe("calculateResources", () => {
  it("counts reserve toward the resource goal but not toward ticket milestones", () => {
    const result = calculateResources({ ...base, pulls: 50, reserve: 20 });
    expect(result.officialTickets).toBe(10);
    expect(result.totalPulls).toBe(70);
    expect(result.gapDia).toBe(9000);
  });

  it("converts diamond reserve to pulls", () => {
    const result = calculateResources({ ...base, pulls: 10, reserve: 1500, reserveUnit: "dia" });
    expect(result.reservePulls).toBe(10);
    expect(result.totalPulls).toBe(20);
  });

  it("never lets non-finite input poison resource results", () => {
    const result = calculateResources({
      ...base,
      cur: Number.POSITIVE_INFINITY,
      tickets: Number.NaN,
      pulls: Number.POSITIVE_INFINITY,
      reserve: Number.POSITIVE_INFINITY,
    });
    expect(Object.values(result).every(Number.isFinite)).toBe(true);
    expect(result.totalPulls).toBe(0);
  });

  it("integerizes count inputs and keeps every huge derived value within the safe range", () => {
    const result = calculateResources({
      ...base,
      cur: Number.MAX_SAFE_INTEGER,
      tickets: 2.8,
      pulls: 40.9,
      reserve: Number.MAX_SAFE_INTEGER,
    });
    expect(result).toMatchObject({ targetPulls: 40, ownedTicketPulls: 12 });
    expect(Object.values(result).every((value) => Number.isFinite(value) && Math.abs(value) <= Number.MAX_SAFE_INTEGER)).toBe(true);
  });
});

describe("recommendPacks", () => {
  it("buys earlier tiers first and only the required packs at the final tier", () => {
    const result = recommendPacks({ ...base, pool: "日卡池", pulls: 40 });
    expect(result.status).toBe("recommended");
    expect(result.tier?.tier).toBe("三");
    expect(result.packsAtTier).toBe(2);
    expect(result.planPulls).toBe(27);
    expect(result.planCost).toBe(525);
  });

  it("returns enough when owned resources already cover the goal", () => {
    const result = recommendPacks({ ...base, pulls: 30, cur: 3000, tickets: 10 });
    expect(result.status).toBe("enough");
    expect(result.gapPulls).toBe(0);
  });
});

describe("recommendPacksForGap", () => {
  it("turns an already-calculated planner deficit into a pack plan without adding tickets again", () => {
    const result = recommendPacksForGap("日卡池", 3900);
    expect(result).toMatchObject({
      status: "recommended",
      gapDia: 3900,
      gapPulls: 26,
      tier: { tier: "三" },
      packsAtTier: 2,
      planPulls: 27,
      planCost: 525,
    });
  });

  it("returns enough for an empty or invalid gap and overflow beyond one pack cycle", () => {
    expect(recommendPacksForGap("混池", Number.NaN)).toMatchObject({ status: "enough", gapDia: 0, gapPulls: 0 });
    expect(recommendPacksForGap("復刻池", 100_000)).toMatchObject({
      status: "overflow",
      gapPulls: 667,
      tier: { tier: "五" },
      packsAtTier: 10,
      planPulls: 306,
      planCost: 11_450,
    });
  });
});

describe("pack table integrity", () => {
  it("keeps every cumulative tier consistent and monotonic", () => {
    for (const pool of POOLS) {
      let cumulativeCost = 0;
      let cumulativePulls = 0;
      const tierNames = new Set<string>();

      for (const tier of PACK_DATA[pool]) {
        expect(tierNames.has(tier.tier), `${pool} ${tier.tier} 階重複`).toBe(false);
        tierNames.add(tier.tier);
        expect(tier.price).toBeGreaterThan(0);
        expect(tier.qty ?? 0).toBeGreaterThan(0);

        cumulativeCost += tier.price * (tier.qty ?? 0);
        if (tier.packPulls !== null) cumulativePulls += tier.packPulls * (tier.qty ?? 0);
        expect(tier.cumCost, `${pool} ${tier.tier} 階累積價格`).toBe(cumulativeCost);
        expect(tier.cumPulls, `${pool} ${tier.tier} 階累積抽數`).toBe(cumulativePulls);

        if (tier.packPulls === null) expect(tier.per).toBeNull();
        else expect(tier.per).toBe(Number((tier.price / tier.packPulls).toFixed(2)));
      }
    }
  });
});

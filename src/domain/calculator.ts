import { DIA_PER_PULL, MONTHLY_DIA, OFFICIAL_TICKET_RULES, PACK_DATA } from "@/data/packs";
import { POOLS, type CalculatorDraft, type PackQuantities, type PackTier, type PendingCalculatorTarget, type Pool, type TicketRule } from "@/domain/types";

export const DEFAULT_CALCULATOR_DRAFT: CalculatorDraft = {
  pool: "日卡池",
  cur: 0,
  tickets: 0,
  pulls: 0,
  reserve: 0,
  reserveUnit: "pulls",
};

function nonNegativeNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.min(value, Number.MAX_SAFE_INTEGER)
    : 0;
}

function nonNegativeInteger(value: unknown): number {
  return Math.floor(nonNegativeNumber(value));
}

function cappedSafeNumber(value: number): number {
  if (!Number.isFinite(value)) return Number.MAX_SAFE_INTEGER;
  return Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, value));
}

export function normalizeCalculatorDraft(value: unknown): CalculatorDraft {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return DEFAULT_CALCULATOR_DRAFT;
  const stored = value as Partial<Record<keyof CalculatorDraft, unknown>>;
  return {
    pool: typeof stored.pool === "string" && POOLS.includes(stored.pool as Pool) ? stored.pool as Pool : "日卡池",
    cur: nonNegativeInteger(stored.cur),
    tickets: nonNegativeInteger(stored.tickets),
    pulls: nonNegativeInteger(stored.pulls),
    reserve: nonNegativeNumber(stored.reserve),
    reserveUnit: stored.reserveUnit === "dia" ? "dia" : "pulls",
    ...(stored.packQuantities === undefined ? {} : { packQuantities: normalizePackQuantities(stored.packQuantities) }),
  };
}

export function normalizePendingCalculatorTarget(value: unknown): PendingCalculatorTarget | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const stored = value as Partial<Record<keyof PendingCalculatorTarget, unknown>>;
  if (!Number.isSafeInteger(stored.pulls) || (stored.pulls as number) <= 0 || (stored.pulls as number) > 999) return null;
  if (stored.pool !== null && (typeof stored.pool !== "string" || !POOLS.includes(stored.pool as Pool))) return null;
  if (typeof stored.source !== "string" || !stored.source.trim() || stored.source.trim().length > 120) return null;
  return { pulls: stored.pulls as number, pool: stored.pool as Pool | null, source: stored.source.trim() };
}

export type ResourcePlan = {
  targetPulls: number;
  reservePulls: number;
  reserveDia: number;
  totalPulls: number;
  officialTickets: number;
  initialTickets: number;
  milestoneTickets: number;
  ownedTicketPulls: number;
  requiredDia: number;
  gapDia: number;
  paidPulls: number;
  availablePulls: number;
  remainingDiaAfterTarget: number;
  savingMonths: number;
};

export type PackRecommendation = {
  status: "idle" | "enough" | "recommended" | "overflow";
  gapPulls: number;
  ownedPulls: number;
  tier?: PackTier;
  packsAtTier?: number;
  planPulls?: number;
  planCost?: number;
  remainingDiaAfterTarget?: number;
};

export type GapPackRecommendation = {
  status: "enough" | "recommended" | "overflow";
  gapDia: number;
  gapPulls: number;
  tier?: PackTier;
  packsAtTier?: number;
  planPulls?: number;
  planCost?: number;
};

type PackPurchase = Pick<
  GapPackRecommendation,
  "status" | "gapPulls" | "tier" | "packsAtTier" | "planPulls" | "planCost"
>;

function purchasePacksForPullGap(pool: Pool, gapPulls: number): PackPurchase {
  if (gapPulls <= 0) return { status: "enough", gapPulls: 0 };

  let planPulls = 0;
  let planCost = 0;
  let lastTier: PackTier | undefined;
  let packsAtLastTier = 0;
  for (const tier of PACK_DATA[pool]) {
    if (tier.packPulls == null || tier.per == null) continue;
    const available = tier.qty ?? 1;
    const needed = Math.min(
      available,
      Math.ceil(Math.max(0, gapPulls - planPulls) / tier.packPulls),
    );
    if (needed > 0) {
      planPulls += needed * tier.packPulls;
      planCost += needed * tier.price;
      lastTier = tier;
      packsAtLastTier = needed;
    }
    if (planPulls >= gapPulls) {
      return {
        status: "recommended",
        gapPulls,
        tier,
        packsAtTier: needed,
        planPulls,
        planCost,
      };
    }
  }

  return {
    status: "overflow",
    gapPulls,
    tier: lastTier,
    packsAtTier: packsAtLastTier,
    planPulls,
    planCost,
  };
}

/**
 * Prices a resource shortfall that has already accounted for owned resources
 * and official ticket rewards. This avoids counting a pool's official tickets
 * a second time when the planner turns a forecast deficit into a purchase plan.
 */
export function recommendPacksForGap(pool: Pool, rawGapDia: number): GapPackRecommendation {
  const gapDia = nonNegativeNumber(rawGapDia);
  const gapPulls = Math.ceil(gapDia / DIA_PER_PULL);
  return { gapDia, ...purchasePacksForPullGap(pool, gapPulls) };
}

export function officialTicketCount(
  pool: Pool,
  target: number,
  rules: Record<Pool, TicketRule> = OFFICIAL_TICKET_RULES,
): number {
  const rule = rules[pool] ?? { initial: 0, milestones: [] };
  let count = Number(rule.initial) || 0;

  for (const milestone of rule.milestones ?? []) {
    // A reward obtained exactly at the target cannot retroactively fund that target.
    if (milestone.at != null) {
      if (milestone.at < target) count += Number(milestone.reward) || 0;
      continue;
    }

    const every = Number(milestone.every) || 1;
    const from = Number(milestone.from) || every;
    const to = Number(milestone.to) || Number.POSITIVE_INFINITY;
    let earned = 0;

    for (let at = from; at <= to && at < target; at += every) {
      earned += Number(milestone.reward) || 0;
      if (milestone.maxReward != null && earned >= milestone.maxReward) {
        earned = milestone.maxReward;
        break;
      }
    }
    count += earned;
  }

  return count;
}

export function reserveAsPulls(draft: CalculatorDraft): number {
  const reserve = nonNegativeNumber(draft.reserve);
  return draft.reserveUnit === "dia" ? reserve / DIA_PER_PULL : reserve;
}

export function calculateResources(draft: CalculatorDraft): ResourcePlan {
  const currentDia = nonNegativeNumber(draft.cur);
  const currentTickets = nonNegativeInteger(draft.tickets);
  const targetPulls = nonNegativeInteger(draft.pulls);
  const reservePulls = cappedSafeNumber(reserveAsPulls(draft));
  const reserveDia = cappedSafeNumber(reservePulls * DIA_PER_PULL);
  const totalPulls = cappedSafeNumber(targetPulls + reservePulls);
  const officialTickets = officialTicketCount(draft.pool, targetPulls);
  const initialTickets = OFFICIAL_TICKET_RULES[draft.pool]?.initial ?? 0;
  const ownedTicketPulls = cappedSafeNumber(currentTickets + officialTickets);
  const requiredDia = cappedSafeNumber(Math.max(0, totalPulls - ownedTicketPulls) * DIA_PER_PULL);
  const gapDia = Math.max(0, requiredDia - currentDia);
  const availablePulls = cappedSafeNumber(Math.floor(currentDia / DIA_PER_PULL) + ownedTicketPulls);
  const remainingDiaAfterTarget = Math.max(
    0,
    currentDia - cappedSafeNumber(Math.max(0, targetPulls - ownedTicketPulls) * DIA_PER_PULL),
  );

  return {
    targetPulls,
    reservePulls,
    reserveDia,
    totalPulls,
    officialTickets,
    initialTickets,
    milestoneTickets: Math.max(0, officialTickets - initialTickets),
    ownedTicketPulls,
    requiredDia,
    gapDia,
    paidPulls: Math.ceil(gapDia / DIA_PER_PULL),
    availablePulls,
    remainingDiaAfterTarget,
    savingMonths: gapDia > 0 ? Math.ceil(gapDia / MONTHLY_DIA) : 0,
  };
}

export function recommendPacks(draft: CalculatorDraft): PackRecommendation {
  const resource = calculateResources(draft);
  const currentDia = nonNegativeNumber(draft.cur);
  const currentTickets = nonNegativeInteger(draft.tickets);
  const gapDia = resource.gapDia;
  const gapPulls = Math.ceil(gapDia / DIA_PER_PULL);
  const ownedPulls = resource.availablePulls;

  if (resource.totalPulls <= 0) return { status: "idle", gapPulls, ownedPulls };
  if (gapPulls <= 0) return { status: "enough", gapPulls: 0, ownedPulls };
  const purchase = purchasePacksForPullGap(draft.pool, gapPulls);
  if (purchase.status !== "recommended") return { ...purchase, ownedPulls };

  const goalDia = cappedSafeNumber(Math.max(
    0,
    resource.targetPulls - currentTickets - resource.officialTickets - purchase.planPulls!,
  ) * DIA_PER_PULL);
  return {
    ...purchase,
    ownedPulls,
    remainingDiaAfterTarget: Math.max(0, currentDia - goalDia),
  };
}

export function bestTierPrice(pool: Pool): number | null {
  const prices = PACK_DATA[pool].flatMap((tier) => (tier.per == null ? [] : [tier.per]));
  return prices.length ? Math.min(...prices) : null;
}

export function normalizePackQuantities(value: unknown): PackQuantities {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const entries = value as Record<string, unknown>;
  return Object.fromEntries(POOLS.flatMap((pool) => {
    const quantities = entries[pool];
    if (!Array.isArray(quantities)) return [];
    return [[pool, PACK_DATA[pool].map((tier, index) =>
      Math.min(tier.qty ?? 1, nonNegativeInteger(Number(quantities[index]))))]];
  }));
}

export function selectedPackQuantities(draft: CalculatorDraft): number[] {
  const manual = normalizePackQuantities(draft.packQuantities)[draft.pool];
  if (manual) return manual;
  let remaining = calculateResources(draft).paidPulls;
  return PACK_DATA[draft.pool].map((tier) => {
    if (!tier.packPulls) return 0;
    const quantity = Math.min(tier.qty ?? 1, Math.ceil(remaining / tier.packPulls));
    remaining = Math.max(0, remaining - quantity * tier.packPulls);
    return quantity;
  });
}

export function summarizeSelectedPacks(draft: CalculatorDraft) {
  const quantities = selectedPackQuantities(draft);
  const resource = calculateResources(draft);
  let cost = 0, pulls = 0, count = 0, unknownPulls = false;
  const items: string[] = [];
  PACK_DATA[draft.pool].forEach((tier, index) => {
    const quantity = quantities[index];
    if (!quantity) return;
    cost += tier.price * quantity;
    count += quantity;
    pulls += (tier.packPulls ?? 0) * quantity;
    unknownPulls ||= tier.packPulls === null;
    items.push(`第${tier.tier}階 ${quantity}包`);
  });
  return {
    quantities, cost, pulls, count, unknownPulls, items,
    missingPulls: Math.max(0, resource.paidPulls - pulls),
    remainingDiaAfterTarget: Math.max(0, draft.cur - Math.max(0, draft.pulls - resource.ownedTicketPulls - pulls) * DIA_PER_PULL),
  };
}

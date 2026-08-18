import { csvCell, isValidDateKey } from "./format";
import {
  FIVE_STAR_OUTCOMES,
  WISH_TRACKS,
  type FiveStarOutcome,
  type FiveStarRecord,
  type FiveStarRecordDraft,
  type WishTrack,
  type WishTrackerState,
} from "./types";

export const DEFAULT_WISH_TRACKER_STATE: WishTrackerState = {
  currentPity: { 限定新池: 0, 復刻池: 0, 常駐池: 0 },
  guaranteeOverrides: { 限定新池: null, 復刻池: null, 常駐池: null },
  records: [],
};

export type WishStatistics = {
  count: number;
  averagePity: number | null;
  earliestPity: number | null;
  latestPity: number | null;
  featuredRate: number | null;
  knownOutcomes: number;
};

export type FeaturedGuarantee = true | false | null;

export const FIVE_STAR_HARD_PITY = 70;

export type FeaturedTarget = {
  nextFiveStarPulls: number;
  featuredPulls: number | null;
  conservative: boolean;
};

export function featuredTargetPulls(
  currentPity: number,
  guarantee: FeaturedGuarantee,
  track: WishTrack,
): FeaturedTarget {
  const safePity = Number.isFinite(currentPity)
    ? Math.min(FIVE_STAR_HARD_PITY, Math.max(0, Math.floor(currentPity)))
    : 0;
  const nextFiveStarPulls = FIVE_STAR_HARD_PITY - safePity;
  if (track === "常駐池") return { nextFiveStarPulls, featuredPulls: null, conservative: false };
  return {
    nextFiveStarPulls,
    featuredPulls: nextFiveStarPulls + (guarantee === true ? 0 : FIVE_STAR_HARD_PITY),
    conservative: guarantee !== true,
  };
}

export function adjustedPityCount(current: number, delta: number): number {
  const safeCurrent = Number.isSafeInteger(current) ? current : 0;
  const safeDelta = Number.isSafeInteger(delta) ? delta : 0;
  return Math.min(999, Math.max(0, safeCurrent + safeDelta));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSafeCount(value: unknown, allowZero: boolean): value is number {
  return typeof value === "number"
    && Number.isSafeInteger(value)
    && value >= (allowZero ? 0 : 1)
    && value <= 999;
}

function isPositiveId(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

export function normalizeFiveStarRecordDraft(value: unknown): FiveStarRecordDraft | null {
  if (!isRecord(value) || !WISH_TRACKS.includes(value.track as WishTrack)) return null;
  if (!isSafeCount(value.pity, false) || !isValidDateKey(value.date)) return null;
  if (typeof value.memory !== "string" || value.memory.trim().length > 120) return null;
  if (!FIVE_STAR_OUTCOMES.includes(value.outcome as FiveStarOutcome)) return null;
  return {
    track: value.track as WishTrack,
    pity: value.pity,
    date: value.date,
    memory: value.memory.trim(),
    outcome: value.outcome as FiveStarOutcome,
  };
}

export function normalizeWishTrackerState(value: unknown): WishTrackerState {
  if (value == null) return {
    currentPity: { ...DEFAULT_WISH_TRACKER_STATE.currentPity },
    guaranteeOverrides: { ...DEFAULT_WISH_TRACKER_STATE.guaranteeOverrides },
    records: [],
  };
  if (!isRecord(value) || !isRecord(value.currentPity) || !Array.isArray(value.records) || value.records.length > 2_000) {
    throw new Error("stored wish tracker is invalid");
  }

  const storedCurrentPity = value.currentPity;
  const currentPity = Object.fromEntries(WISH_TRACKS.map((track) => {
    const count = storedCurrentPity[track];
    if (!isSafeCount(count, true)) throw new Error("stored pity count is invalid");
    return [track, count];
  })) as Record<WishTrack, number>;
  const ids = new Set<number>();
  const records = value.records.map((entry) => {
    if (!isRecord(entry) || !isPositiveId(entry.id) || ids.has(entry.id)) {
      throw new Error("stored five-star id is invalid");
    }
    const draft = normalizeFiveStarRecordDraft(entry);
    if (!draft) throw new Error("stored five-star record is invalid");
    ids.add(entry.id);
    return { id: entry.id, ...draft };
  });

  let guaranteeOverrides = { ...DEFAULT_WISH_TRACKER_STATE.guaranteeOverrides };
  if (value.guaranteeOverrides !== undefined) {
    const storedGuaranteeOverrides = value.guaranteeOverrides;
    if (!isRecord(storedGuaranteeOverrides)) throw new Error("stored guarantee override is invalid");
    guaranteeOverrides = Object.fromEntries(WISH_TRACKS.map((track) => {
      const override = storedGuaranteeOverrides[track];
      if (override !== null && typeof override !== "boolean") throw new Error("stored guarantee override is invalid");
      return [track, track === "常駐池" ? null : override];
    })) as Record<WishTrack, FeaturedGuarantee>;
  }

  return { currentPity, guaranteeOverrides, records };
}

export function nextFiveStarRecordId(records: FiveStarRecord[], lastIssued = 0, now = Date.now()): number {
  const largest = records.reduce((result, record) => Math.max(result, record.id), 0);
  return Math.max(Math.floor(now), Math.floor(lastIssued) + 1, largest + 1);
}

export function wishStatistics(records: FiveStarRecord[], track: WishTrack | null = null): WishStatistics {
  const filtered = track ? records.filter((record) => record.track === track) : records;
  const known = filtered.filter((record) => record.outcome !== "未標記");
  const pityTotal = filtered.reduce((total, record) => total + record.pity, 0);
  return {
    count: filtered.length,
    averagePity: filtered.length ? Math.round((pityTotal / filtered.length) * 10) / 10 : null,
    earliestPity: filtered.length ? Math.min(...filtered.map((record) => record.pity)) : null,
    latestPity: filtered.length ? Math.max(...filtered.map((record) => record.pity)) : null,
    featuredRate: known.length
      ? Math.round((known.filter((record) => record.outcome === "當期UP").length / known.length) * 100)
      : null,
    knownOutcomes: known.length,
  };
}

export function nextFeaturedGuarantee(records: FiveStarRecord[], track: WishTrack): FeaturedGuarantee {
  if (track === "常駐池") return null;
  const latest = records
    .filter((record) => record.track === track)
    .sort((left, right) => right.date.localeCompare(left.date) || right.id - left.id)[0];
  if (!latest || latest.outcome === "未標記") return null;
  return latest.outcome === "非當期";
}

export function resolvedFeaturedGuarantee(
  records: FiveStarRecord[],
  overrides: Record<WishTrack, FeaturedGuarantee>,
  track: WishTrack,
): FeaturedGuarantee {
  if (track === "常駐池") return null;
  return overrides[track] ?? nextFeaturedGuarantee(records, track);
}

export function wishRecordsToCsv(records: FiveStarRecord[]): string {
  return [
    ["date", "track", "pity", "outcome", "memory"].map(csvCell).join(","),
    ...[...records]
      .sort((left, right) => right.date.localeCompare(left.date) || right.id - left.id)
      .map((record) => [record.date, record.track, record.pity, record.outcome, record.memory].map(csvCell).join(",")),
  ].join("\n");
}

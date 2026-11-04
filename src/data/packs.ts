import { POOLS, type Currency, type Pool, type RegionalPackTier } from "../domain/types";
import { PACK_DATA, REGIONAL_PACK_PRICES, REGIONAL_PACK_PRICE_REFERENCES } from "./packData";

export { MONTHLY_DIA, DIA_PER_PULL, OFFICIAL_TICKET_RULES, PACK_DATA, PACK_OTHER } from "./packData";

export function normalizePool(value: unknown): Pool {
  if (value === "復刻池" || value === "月卡／生日復刻池") return "生日復刻池";
  return POOLS.includes(value as Pool) ? value as Pool : "日卡池";
}

export function migratePoolRecords(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result = { ...value as Record<string, unknown> };
  for (const legacy of ["月卡／生日復刻池", "復刻池"]) {
    if (Object.hasOwn(result, legacy) && !Object.hasOwn(result, "生日復刻池")) result["生日復刻池"] = result[legacy];
    delete result[legacy];
  }
  return result;
}

export function resolvePackPrice(pool: Pool, tier: string, currency: Currency = "TWD") {
  const base = PACK_DATA[pool].find(item => item.tier === tier);
  const missing = (method: string) => ({ price: null, status: "missing" as const, source: "", method });
  if (!base) return missing("缺少禮包內容");
  if (currency === "TWD") return { price: base.price, status: "confirmed" as const, source: base.source ?? "戀與深空_禮包總表", method: base.source ? "玩家截圖實價" : "台灣原始資料" };
  const rows = REGIONAL_PACK_PRICES.filter(row => row.currency === currency);
  const direct = rows.filter(row => row.pool === pool && row.tier === tier);
  if (direct.length) {
    if (direct.some(row => row.price !== direct[0].price)) return missing("實價資料衝突，待確認");
    return { price: direct[0].price, status: "confirmed" as const, source: direct[0].source, method: "玩家截圖實價" };
  }
  const reference = REGIONAL_PACK_PRICE_REFERENCES.find(row => row.pool === pool && row.tier === tier);
  if (reference) {
    const matches = rows.filter(row => row.pool === reference.referencePool && row.tier === reference.referenceTier);
    if (!matches.length) return missing("缺少對應卡池的截圖售價");
    if (matches.some(row => row.price !== matches[0].price)) return missing("參照售價衝突，待確認");
    const confirmed = "confirmed" in reference && reference.confirmed;
    return { price: matches[0].price, status: confirmed ? "confirmed" as const : "estimated" as const, source: matches[0].source, method: confirmed ? `使用者確認：比照${reference.referencePool}第${reference.referenceTier}階售價（${reference.confirmedAt}）` : `參考${reference.referencePool}第${reference.referenceTier}階截圖售價` };
  }
  if (pool === "混池復刻池") return missing("混池復刻池地區售價待確認");
  const anchors = rows.filter(row => row.pool === "混池").sort((a, b) => a.twdPrice - b.twdPrice);
  const match = anchors.find(row => row.twdPrice === base.price);
  if (match) return { price: match.price, status: "estimated" as const, source: match.source, method: `參考混池 NT$${base.price} 同價位禮包` };
  const lower = anchors.filter(row => row.twdPrice < base.price).at(-1);
  const upper = anchors.find(row => row.twdPrice > base.price);
  if (!lower || !upper) return missing("超出參考價位範圍，待確認");
  const price = Math.round((lower.price + (upper.price - lower.price) * (base.price - lower.twdPrice) / (upper.twdPrice - lower.twdPrice)) * 100) / 100;
  return { price, status: "estimated" as const, source: lower.source, method: `混池 NT$${lower.twdPrice}–${upper.twdPrice} 售價線性內插，非匯率換算` };
}

export function getPackTiers(pool: Pool, currency: Currency = "TWD"): RegionalPackTier[] {
  let cumCost: number | null = 0;
  let cumPulls = 0;
  return PACK_DATA[pool].map(tier => {
    const resolved = resolvePackPrice(pool, tier.tier, currency);
    cumCost = resolved.price == null || cumCost == null ? null : Math.round((cumCost + resolved.price * (tier.qty ?? 1)) * 100) / 100;
    cumPulls += (tier.packPulls ?? 0) * (tier.qty ?? 1);
    return { ...tier, currency, price: resolved.price, cumCost, cumPulls, per: tier.packPulls && resolved.price != null ? resolved.price / tier.packPulls : null, priceStatus: resolved.status, priceSource: resolved.source, priceMethod: resolved.method };
  });
}

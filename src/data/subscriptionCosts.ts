import { DIA_PER_PULL, REGIONAL_SUBSCRIPTION_PRICES, SUBSCRIPTION_PACKS } from "./packData";
import type { Currency } from "@/domain/types";

export { SUBSCRIPTION_COST_NOTE } from "./packData";

export function getSubscriptionCosts(currency: Currency = "TWD") {
  return SUBSCRIPTION_PACKS.map(pack => {
    const rows = REGIONAL_SUBSCRIPTION_PRICES.filter(row => row.tier === pack.name && row.currency === currency);
    const price = currency === "TWD" ? pack.price : rows.length && !rows.some(row => row.price !== rows[0].price) ? rows[0].price : null;
    return {
      ...pack, currency, price,
      perPull: price == null ? null : price / (pack.diamonds / DIA_PER_PULL),
      priceStatus: price == null ? "missing" : "confirmed",
      priceSource: currency === "TWD" ? pack.source : rows.map(row => row.source).join("；"),
    };
  });
}

import { readFileSync } from "node:fs";
import vm from "node:vm";
import { describe, expect, it } from "vitest";

import { getSubscriptionCosts } from "@/data/subscriptionCosts";
import { REGIONAL_SUBSCRIPTION_PRICES } from "@/data/packData";
import { CURRENCIES, type Currency } from "@/domain/types";

describe("subscription costs", () => {
  it("matches the shared web source for all currencies after data generation", () => {
    const context = { window: {} as { getSubscriptionCosts: (currency: Currency) => ReturnType<typeof getSubscriptionCosts> } };
    for (const file of ["regional-prices.js", "packs.js"]) vm.runInNewContext(readFileSync(new URL(`../${file}`, import.meta.url), "utf8"), context);
    for (const currency of CURRENCIES) expect(getSubscriptionCosts(currency)).toEqual(context.window.getSubscriptionCosts(currency));
  });

  it("does not use Taiwan prices when regional evidence is missing or conflicting", () => {
    const original = [...REGIONAL_SUBSCRIPTION_PRICES];
    try {
      REGIONAL_SUBSCRIPTION_PRICES.splice(0, REGIONAL_SUBSCRIPTION_PRICES.length);
      expect(getSubscriptionCosts("MYR").every(pack => pack.price === null && pack.perPull === null)).toBe(true);
      REGIONAL_SUBSCRIPTION_PRICES.push(...original, { ...original[0], price: 39 });
      expect(getSubscriptionCosts("HKD")[0].priceStatus).toBe("missing");
      expect(getSubscriptionCosts("HKD")[0].perPull).toBeNull();
    } finally {
      REGIONAL_SUBSCRIPTION_PRICES.splice(0, REGIONAL_SUBSCRIPTION_PRICES.length, ...original);
    }
  });
});

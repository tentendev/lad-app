import { describe, expect, it } from "vitest";
import { hasUnreadSiteUpdate, type SiteUpdate } from "@/domain/siteUpdates";

const latest: SiteUpdate = { id: "new", date: "2026-10-02", items: [] };
describe("notice read preferences", () => {
  it("reminds only for the latest unread release", () => {
    expect(hasUnreadSiteUpdate(latest, [])).toBe(true);
    expect(hasUnreadSiteUpdate(latest, ["old"])).toBe(true);
    expect(hasUnreadSiteUpdate(latest, ["new"])).toBe(false);
    expect(hasUnreadSiteUpdate(latest, ["new", "old"])).toBe(false);
  });
  it("treats corrupt preferences as unread and hides an absent notice", () => {
    for (const saved of [null, {}, "new", 42]) expect(hasUnreadSiteUpdate(latest, saved)).toBe(true);
    expect(hasUnreadSiteUpdate(undefined, [])).toBe(false);
  });
});

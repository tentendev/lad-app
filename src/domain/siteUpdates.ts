export type SiteUpdate = {
  id: string;
  date: string;
  items: { type: "schedule" | "feature"; title: string; body: string }[];
};

export const SITE_UPDATES_STORAGE_KEY = "readSiteUpdates";

export function hasUnreadSiteUpdate(latest: SiteUpdate | undefined, saved: unknown): boolean {
  return Boolean(latest && (!Array.isArray(saved) || !saved.includes(latest.id)));
}

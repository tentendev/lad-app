export const OFFLINE_AUTH_MESSAGE =
  "目前處於離線狀態。請連上網路後再登入或驗證；本機功能仍可繼續使用。";

export function isWebAuthOffline(platform: string, online: boolean | undefined): boolean {
  return platform === "web" && online === false;
}

export function isCurrentWebAuthOffline(platform: string): boolean {
  const online = typeof navigator === "undefined" ? undefined : navigator.onLine;
  return isWebAuthOffline(platform, online);
}

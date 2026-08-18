export function apiEndpoint(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const configured = process.env.EXPO_PUBLIC_SYNC_API_URL?.replace(/\/$/, "");
  if (configured) return `${configured}${normalizedPath}`;
  return normalizedPath;
}

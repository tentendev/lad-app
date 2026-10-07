export function apiEndpoint(path: string): string {
  // Web deployments serve their API on the same origin, including custom domains.
  // The configured absolute URL is used by apiEndpoint.native.ts only.
  return path.startsWith("/") ? path : `/${path}`;
}

/** Revisions cross JSON and PostgreSQL bigint boundaries, so only exact JS integers are safe. */
export function isSafeRevision(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

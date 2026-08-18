import { describe, expect, it } from "vitest";

import { isSafeRevision } from "@/domain/sync";

describe("cloud revision boundary", () => {
  it("accepts exact non-negative revisions and rejects unsafe JSON numbers", () => {
    expect(isSafeRevision(0)).toBe(true);
    expect(isSafeRevision(Number.MAX_SAFE_INTEGER)).toBe(true);
    expect(isSafeRevision(-1)).toBe(false);
    expect(isSafeRevision(1.5)).toBe(false);
    expect(isSafeRevision(1e100)).toBe(false);
    expect(isSafeRevision("1")).toBe(false);
  });
});

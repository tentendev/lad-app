import { describe, expect, it } from "vitest";

import { isWebAuthOffline } from "../src/auth/networkAvailability";

describe("authentication network availability", () => {
  it("blocks web authentication only when the browser reports offline", () => {
    expect(isWebAuthOffline("web", false)).toBe(true);
    expect(isWebAuthOffline("web", true)).toBe(false);
    expect(isWebAuthOffline("web", undefined)).toBe(false);
  });

  it("does not infer native connectivity from the browser signal", () => {
    expect(isWebAuthOffline("ios", false)).toBe(false);
    expect(isWebAuthOffline("android", false)).toBe(false);
  });
});

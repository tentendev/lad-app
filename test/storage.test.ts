import { describe, expect, it } from "vitest";

import { parseStored } from "@/data/repositories/storage.types";

describe("stored JSON parsing", () => {
  it("uses the fallback only when no value exists", () => {
    expect(parseStored(null, { safe: true })).toEqual({ safe: true });
    expect(parseStored("null", { safe: true })).toEqual({ safe: true });
  });

  it("returns valid stored JSON", () => {
    expect(parseStored('{"amount":3000}', {})).toEqual({ amount: 3000 });
  });

  it("rejects malformed JSON instead of silently overwriting it", () => {
    expect(() => parseStored('{"amount":', {})).toThrow("stored JSON is invalid");
  });
});

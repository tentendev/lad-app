import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const queryString = require("query-string");

describe("Expo query-string decoder security compatibility", () => {
  it("preserves Unicode, plus handling, malformed bytes and repeated parameters", () => {
    expect(queryString.parse("title=%E6%B7%B1%E7%A9%BA&note=a+b&bad=%E0%A4%A&tag=a&tag=b")).toEqual({
      title: "深空", note: "a b", bad: "%E0%A4%A", tag: ["a", "b"],
    });
    expect(queryString.parse(queryString.stringify({ callback: "deep-space-ledger://sso-callback", note: "a+b" }))).toEqual({
      callback: "deep-space-ledger://sso-callback", note: "a+b",
    });
  });

  it("finishes a long malformed URL without exponential decoding", () => {
    // A child timeout also prevents a vulnerable decoder from hanging the test runner.
    const output = execFileSync(process.execPath, ["-e", `const q = require('query-string'); const input = '%FF'.repeat(50000); if (q.parse('value=' + input).value !== input) process.exit(1); process.stdout.write('ok');`], { timeout: 3000, encoding: "utf8" });
    expect(output).toBe("ok");
  });
});

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

  it("decodes each run once without reinterpreting decoded percent signs", () => {
    expect(queryString.parse("value=%2541x%41%zz").value).toBe("%41xA%zz");
    expect(queryString.parse("value=%FE%FFx%C2").value).toBe("\uFFFD\uFFFDx\uFFFD");
  });

  it("finishes many distinct malformed runs without quadratic replacements", () => {
    const source = `const q = require('query-string'); let input = ''; for (let i = 0; i < 32000; i++) { const high = Math.floor(i / 256).toString(16).padStart(2, '0'); const low = (i % 256).toString(16).padStart(2, '0'); input += '%' + high + '%' + low + 'x'; } input += '%zz'; const value = q.parse('value=' + input).value; if (typeof value !== 'string' || !value.endsWith('%zz')) process.exit(1); process.stdout.write('ok');`;
    const output = execFileSync(process.execPath, ["-e", source], { timeout: 3000, encoding: "utf8" });
    expect(output).toBe("ok");
  });
});

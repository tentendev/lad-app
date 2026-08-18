import { describe, expect, it } from "vitest";

import { csvCell, isValidDateKey, isValidMonthKey } from "@/domain/format";

describe("storage date validation", () => {
  it("accepts real calendar dates, including leap day", () => {
    expect(isValidDateKey("2028-02-29")).toBe(true);
    expect(isValidDateKey("2026-08-14")).toBe(true);
  });

  it("rejects impossible or loosely formatted dates", () => {
    expect(isValidDateKey("2026-02-29")).toBe(false);
    expect(isValidDateKey("2026-99-99")).toBe(false);
    expect(isValidDateKey("2026-8-14")).toBe(false);
  });

  it("accepts only calendar month keys", () => {
    expect(isValidMonthKey("2026-08")).toBe(true);
    expect(isValidMonthKey("2026-13")).toBe(false);
    expect(isValidMonthKey("2026-8")).toBe(false);
  });

  it("quotes CSV cells and neutralizes spreadsheet formulas in user text", () => {
    expect(csvCell('卡 "A",限定')).toBe('"卡 ""A"",限定"');
    expect(csvCell("=HYPERLINK(\"bad\")")).toBe('"\'=HYPERLINK(""bad"")"');
    expect(csvCell("  @SUM(A1)")).toBe('"\'  @SUM(A1)"');
    expect(csvCell(150)).toBe('"150"');
  });
});

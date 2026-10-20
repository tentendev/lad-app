import { describe, expect, it } from "vitest";
import { nativeCalendarWidth, nativeColumnWidth, nativePageLayout } from "../src/ui/nativeLayout";

describe("native layouts on supported devices", () => {
  it.each([375, 393, 744, 820, 1024, 1180, 1366])("keeps content inside a %i point window", width => {
    const layout = nativePageLayout(width, true);
    const contentWidth = Math.min(layout.maxWidth, width - layout.horizontalPadding * 2);
    expect(contentWidth + layout.horizontalPadding * 2).toBeLessThanOrEqual(width);
    if (width >= 744) expect(contentWidth).toBeGreaterThan(520);
  });

  it.each([347, 500, 696, 772, 1132, 1200])("keeps two columns and their gap within %i points", width => {
    const column = nativeColumnWidth(width, 1, 340);
    if (column < width) {
      expect(column).toBeGreaterThanOrEqual(340);
      expect(column * 2 + 16).toBe(width);
    } else {
      expect(column).toBe(width);
    }
  });

  it("stacks fields for accessibility text and narrow multitasking windows", () => {
    expect(nativeColumnWidth(1132, 2, 340)).toBe(1132);
    expect(nativeColumnWidth(500, 1, 340)).toBe(500);
  });

  it("sizes the calendar from its measured container while preserving tappable compact days", () => {
    expect(nativeCalendarWidth(746)).toBe(746);
    expect(nativeCalendarWidth(1106)).toBe(1106);
    expect(nativeCalendarWidth(310)).toBe(7 * 48);
  });
});

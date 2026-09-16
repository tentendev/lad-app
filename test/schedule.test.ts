import { describe, expect, it } from "vitest";

import {
  EVENT_LABELS,
  calendarBarSegments,
  daysBetween,
  eventsForDate,
  eventsForMonth,
  eventStatus,
  normalizeSchedulePreferences,
  scheduleEventCalendarFilename,
  scheduleEventToIcs,
  scheduleEventsToIcs,
} from "@/domain/schedule";
import { SCHEDULE } from "@/data/schedule";
import { isValidDateKey } from "@/domain/format";
import { LEADS, type ScheduleEvent } from "@/domain/types";

const events: ScheduleEvent[] = [
  { name: "長期密約", type: "pass", start: "2026-08-01", end: "2026-09-30", tentative: true },
  { name: "卡池", type: "daily", start: "2026-08-10", end: "2026-08-20", tentative: false },
];

describe("schedule visibility", () => {
  it("counts calendar days without local daylight-saving drift", () => {
    expect(daysBetween("2026-11-02", "2026-11-01")).toBe(1);
    expect(daysBetween("2026-03-09", "2026-03-08")).toBe(1);
  });

  it("shows pass events only on their start date in the daily calendar", () => {
    expect(eventsForDate(events, "2026-08-01").map((event) => event.name)).toContain("長期密約");
    expect(eventsForDate(events, "2026-08-15").map((event) => event.name)).not.toContain("長期密約");
  });

  it("labels an event's end date as its last day instead of zero days remaining", () => {
    expect(eventStatus(events[1], "2026-08-20")).toEqual({ label: "最後一天", tone: "live" });
    expect(eventStatus(events[1], "2026-08-21")).toEqual({ label: "已結束", tone: "past" });
  });

  it("keeps long-running events in the monthly list", () => {
    expect(eventsForMonth(events, 2026, 8).map((event) => event.name)).toContain("長期密約");
  });

  it("splits multi-week events into visual bar segments", () => {
    const segments = calendarBarSegments(events, 2026, 7);
    const bannerSegments = segments.filter((segment) => segment.event.name === "卡池");

    expect(bannerSegments).toHaveLength(2);
    expect(bannerSegments[0]).toMatchObject({ week: 2, startColumn: 2, endColumn: 7 });
    expect(bannerSegments[1]).toMatchObject({ week: 3, startColumn: 1, endColumn: 5 });
  });

  it("renders pass events as a single-day bar", () => {
    const segments = calendarBarSegments(events, 2026, 7).filter(
      (segment) => segment.event.name === "長期密約",
    );

    expect(segments).toHaveLength(1);
    expect(segments[0]).toMatchObject({ startColumn: 7, endColumn: 7 });
  });

  it("preserves the original main-story schedule category", () => {
    expect(EVENT_LABELS.story).toBe("主線分線");
  });

  it("repairs and deduplicates persisted lead filters in canonical order", () => {
    expect(normalizeSchedulePreferences({ selectedLeads: ["秦徹", "秦徹", "黎深", "不存在"] }))
      .toEqual({ selectedLeads: ["黎深", "秦徹"] });
    expect(normalizeSchedulePreferences({ selectedLeads: [] })).toEqual({ selectedLeads: [] });
    expect(normalizeSchedulePreferences(null)).toEqual({ selectedLeads: [...LEADS] });
  });

  it("exports a portable all-day calendar event with an exclusive end date", () => {
    const ics = scheduleEventToIcs({
      name: "祁煜,復刻;池",
      type: "rerun",
      start: "2026-08-19",
      end: "2026-08-21",
      tentative: true,
    });

    expect(ics).toContain("DTSTART;VALUE=DATE:20260819\r\n");
    expect(ics).toContain("DTEND;VALUE=DATE:20260822\r\n");
    expect(ics).toContain("SUMMARY:祁煜\\,復刻\\;池\r\n");
    expect(ics).toContain("DESCRIPTION:排期預測，請以官方公告為準 · 復刻池\r\n");
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(scheduleEventCalendarFilename({ ...events[1], name: "卡池/測試" })).toBe("2026-08-10-卡池-測試.ics");
  });

  it("exports the visible schedule as one valid multi-event calendar", () => {
    const ics = scheduleEventsToIcs(events);
    expect(ics.match(/BEGIN:VCALENDAR/g)).toHaveLength(1);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(ics).toContain("SUMMARY:長期密約\r\n");
    expect(ics).toContain("SUMMARY:卡池\r\n");
    expect(ics.match(/UID:/g)).toHaveLength(2);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
  });

  it("folds long Unicode content lines without splitting a UTF-8 character", () => {
    const name = "花承春意甜夢清歡".repeat(8);
    const ics = scheduleEventToIcs({ ...events[1], name });
    const physicalLines = ics.split("\r\n");
    expect(physicalLines.every((line) => new TextEncoder().encode(line).length <= 75)).toBe(true);
    expect(physicalLines.some((line) => line.startsWith(" "))).toBe(true);
    expect(ics.replaceAll("\r\n ", "")).toContain(`SUMMARY:${name}\r\n`);
  });

  it("keeps the complete schedule table internally valid", () => {
    for (const event of SCHEDULE) {
      expect(event.name.trim().length, "排期名稱不可為空").toBeGreaterThan(0);
      expect(isValidDateKey(event.start), `${event.name} 開始日期`).toBe(true);
      if (event.end === "") {
        expect(event.type, "只有未確認的密約可缺少結束日").toBe("pass");
        expect(event.tentative).toBe(true);
      } else {
        expect(isValidDateKey(event.end), `${event.name} 結束日期`).toBe(true);
        expect(event.start <= event.end, `${event.name} 起訖順序`).toBe(true);
      }
      expect(new Set(event.leads ?? []).size, `${event.name} 男主不可重複`).toBe(event.leads?.length ?? 0);
      for (const lead of event.leads ?? []) expect(LEADS).toContain(lead);
    }
  });

  it("never exceeds the three visible calendar lanes in the published data range", () => {
    for (let offset = 0; offset < 7; offset += 1) {
      const date = new Date(2026, 7 + offset, 1);
      const segments = calendarBarSegments(SCHEDULE, date.getFullYear(), date.getMonth());
      const occupancy = new Map<string, number>();

      for (const segment of segments) {
        for (let column = segment.startColumn; column <= segment.endColumn; column += 1) {
          const key = `${segment.week}-${column}`;
          occupancy.set(key, (occupancy.get(key) ?? 0) + 1);
        }
      }

      expect(Math.max(0, ...occupancy.values())).toBeLessThanOrEqual(3);
      const visibleEvents = eventsForMonth(SCHEDULE, date.getFullYear(), date.getMonth())
        .filter((event) => event.type !== "pass" || event.start.startsWith(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`));
      for (const event of visibleEvents) {
        expect(segments.some((segment) => segment.event === event), `${event.name} 不可整筆被 lane 限制隱藏`).toBe(true);
      }
    }
  });
});

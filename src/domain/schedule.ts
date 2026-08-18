import { LEADS, type Lead, type ScheduleEvent, type ScheduleEventType } from "@/domain/types";
import { pad, toDateKey } from "@/domain/format";

export type SchedulePreferences = {
  selectedLeads: Lead[];
};

export const DEFAULT_SCHEDULE_PREFERENCES: SchedulePreferences = { selectedLeads: [...LEADS] };

export function normalizeSchedulePreferences(value: unknown): SchedulePreferences {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return { selectedLeads: [...LEADS] };
  const selectedLeads = (value as { selectedLeads?: unknown }).selectedLeads;
  if (!Array.isArray(selectedLeads)) return { selectedLeads: [...LEADS] };
  return {
    selectedLeads: LEADS.filter((lead) => selectedLeads.includes(lead)),
  };
}

export const EVENT_LABELS: Record<ScheduleEventType, string> = {
  merch: "周邊",
  daily: "日卡池",
  monthly: "月卡池",
  mixed: "混池",
  birthday: "生日池",
  rerun: "復刻池",
  pass: "密約",
  story: "主線分線",
};

function localDate(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function compactDate(dateKey: string): string {
  return dateKey.replaceAll("-", "");
}

function nextDateKey(dateKey: string): string {
  const date = localDate(dateKey);
  date.setUTCDate(date.getUTCDate() + 1);
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function escapeIcsText(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;");
}

function utf8Octets(character: string): number {
  const codePoint = character.codePointAt(0) ?? 0;
  if (codePoint <= 0x7f) return 1;
  if (codePoint <= 0x7ff) return 2;
  if (codePoint <= 0xffff) return 3;
  return 4;
}

/** RFC 5545 content lines are folded at 75 octets, never through a UTF-8 code point. */
function foldIcsLine(line: string): string[] {
  const folded: string[] = [];
  let current = "";
  let currentOctets = 0;

  for (const character of line) {
    const characterOctets = utf8Octets(character);
    if (current && currentOctets + characterOctets > 75) {
      folded.push(current);
      current = ` ${character}`;
      currentOctets = 1 + characterOctets;
    } else {
      current += character;
      currentOctets += characterOctets;
    }
  }
  folded.push(current);
  return folded;
}

function eventUid(event: ScheduleEvent): string {
  const value = `${event.start}|${event.end}|${event.type}|${event.name}`;
  let hash = 2_166_136_261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return `${(hash >>> 0).toString(16)}@deep-space-ledger.local`;
}

function scheduleEventLines(event: ScheduleEvent): string[] {
  const end = event.type === "pass" ? event.end || event.start : event.end || event.start;
  const description = `${event.tentative ? "排期預測，請以官方公告為準" : "官方公告排期"} · ${EVENT_LABELS[event.type]}`;
  return [
    "BEGIN:VEVENT",
    `UID:${eventUid(event)}`,
    `DTSTART;VALUE=DATE:${compactDate(event.start)}`,
    `DTEND;VALUE=DATE:${compactDate(nextDateKey(end))}`,
    `SUMMARY:${escapeIcsText(event.name)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    "TRANSP:TRANSPARENT",
    "END:VEVENT",
  ];
}

/** Builds one portable calendar containing every supplied all-day event. */
export function scheduleEventsToIcs(events: ScheduleEvent[]): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Deep Space Ledger//Schedule//ZH-TW",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...events.flatMap(scheduleEventLines),
    "END:VCALENDAR",
    "",
  ];
  return lines.flatMap(foldIcsLine).join("\r\n");
}

/** Builds a portable all-day calendar event. DTEND is exclusive per RFC 5545. */
export function scheduleEventToIcs(event: ScheduleEvent): string {
  return scheduleEventsToIcs([event]);
}

export function scheduleEventCalendarFilename(event: ScheduleEvent): string {
  const safeName = event.name.trim().replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, "-").slice(0, 48) || "schedule-event";
  return `${event.start}-${safeName}.ics`;
}

export function daysBetween(dateKey: string, today: string): number {
  return Math.round((localDate(dateKey).getTime() - localDate(today).getTime()) / 86_400_000);
}

export function eventStatus(event: ScheduleEvent, today: string): { label: string; tone: string } {
  const startDiff = daysBetween(event.start, today);
  const endDiff = daysBetween(event.end || event.start, today);
  if (endDiff < 0) return { label: "已結束", tone: "past" };
  if (startDiff <= 0) return { label: endDiff === 0 ? "最後一天" : `進行中 · 剩${endDiff}天`, tone: "live" };
  return { label: `${startDiff}天後`, tone: "soon" };
}

export function eventsForDate(events: ScheduleEvent[], dateKey: string): ScheduleEvent[] {
  return events.filter((event) => {
    if (event.type === "pass") return event.start === dateKey;
    return event.start <= dateKey && (event.end || event.start) >= dateKey;
  });
}

export function eventsForMonth(events: ScheduleEvent[], year: number, monthIndex: number): ScheduleEvent[] {
  const first = `${year}-${pad(monthIndex + 1)}-01`;
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  const last = `${year}-${pad(monthIndex + 1)}-${pad(lastDay)}`;
  return events
    .filter((event) => event.start <= last && (event.end || event.start) >= first)
    .sort((a, b) => a.start.localeCompare(b.start));
}

export type CalendarCell = {
  key: string;
  day: number;
  weekday: number;
  eventCount: number;
};

export type CalendarBarSegment = {
  key: string;
  event: ScheduleEvent;
  week: number;
  startColumn: number;
  endColumn: number;
  lane: number;
};

export function calendarCells(
  events: ScheduleEvent[],
  year: number,
  monthIndex: number,
): { leading: number; cells: CalendarCell[] } {
  const firstDate = new Date(year, monthIndex, 1);
  const days = new Date(year, monthIndex + 1, 0).getDate();
  return {
    leading: firstDate.getDay(),
    cells: Array.from({ length: days }, (_, index) => {
      const date = new Date(year, monthIndex, index + 1);
      const key = toDateKey(date);
      return {
        key,
        day: index + 1,
        weekday: date.getDay(),
        eventCount: eventsForDate(events, key).length,
      };
    }),
  };
}

export function calendarBarSegments(
  events: ScheduleEvent[],
  year: number,
  monthIndex: number,
  maxLanes = 3,
): CalendarBarSegment[] {
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const days = new Date(year, monthIndex + 1, 0).getDate();
  const monthKey = `${year}-${pad(monthIndex + 1)}`;
  const monthStart = `${monthKey}-01`;
  const monthEnd = `${monthKey}-${pad(days)}`;
  const visible = events
    .filter((event) => {
      const effectiveEnd = event.type === "pass" ? event.start : event.end || event.start;
      return event.start <= monthEnd && effectiveEnd >= monthStart;
    })
    .map((event) => {
      const effectiveEnd = event.type === "pass" ? event.start : event.end || event.start;
      const startDay = event.start.startsWith(monthKey) ? Number(event.start.slice(8, 10)) : 1;
      const endDay = effectiveEnd.startsWith(monthKey) ? Number(effectiveEnd.slice(8, 10)) : days;
      return {
        event,
        startIndex: firstWeekday + startDay - 1,
        endIndex: firstWeekday + endDay - 1,
      };
    })
    .sort((a, b) => a.startIndex - b.startIndex || a.endIndex - b.endIndex);

  const weeks = Math.ceil((firstWeekday + days) / 7);
  const segments: CalendarBarSegment[] = [];

  for (let week = 0; week < weeks; week += 1) {
    const weekStart = week * 7;
    const weekEnd = weekStart + 6;
    const laneEnds = Array.from({ length: maxLanes }, () => 0);

    visible.forEach(({ event, startIndex, endIndex }) => {
      const segmentStart = Math.max(startIndex, weekStart);
      const segmentEnd = Math.min(endIndex, weekEnd);
      if (segmentStart > segmentEnd) return;

      const startColumn = segmentStart - weekStart + 1;
      const endColumn = segmentEnd - weekStart + 1;
      const lane = laneEnds.findIndex((lastColumn) => startColumn > lastColumn);
      if (lane < 0) return;
      laneEnds[lane] = endColumn;
      segments.push({
        key: `${event.name}-${event.start}-${week}-${lane}`,
        event,
        week,
        startColumn,
        endColumn,
        lane,
      });
    });
  }

  return segments;
}

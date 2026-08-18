export function formatCurrency(value: number): string {
  return `NT$${Number(value || 0).toLocaleString("zh-TW")}`;
}

export function formatNumber(value: number, maxFractionDigits = 2): string {
  return Number(value || 0).toLocaleString("zh-TW", { maximumFractionDigits: maxFractionDigits });
}

/** Quotes a CSV cell and prevents user-entered text from becoming a spreadsheet formula. */
export function csvCell(value: string | number): string {
  const source = String(value);
  const safe = typeof value === "string" && /^[\u0000-\u0020]*[=+\-@]/.test(source) ? `'${source}` : source;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayKey(now = new Date()): string {
  return toDateKey(now);
}

export function currentMonthKey(now = new Date()): string {
  return todayKey(now).slice(0, 7);
}

export function isValidDateKey(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function isValidMonthKey(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

export function monthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  return `${year}年${month}月`;
}

export function moveMonth(monthKey: string, delta: number): string {
  const [year, month] = monthKey.split("-").map(Number);
  const target = new Date(year, month - 1 + delta, 1);
  return `${target.getFullYear()}-${pad(target.getMonth() + 1)}`;
}

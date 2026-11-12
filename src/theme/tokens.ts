import type { Lead, ScheduleEventType } from "@/domain/types";

export const APP_COLORS = {
  canvas: "#f7f6fa",
  glass: "rgba(255,255,255,0.88)",
  navigation: "rgba(250,248,254,0.96)",
  line: "#ddd5e9",
  input: "#fbf9fe",
  text: "#383144",
  muted: "#71667e",
  accent: "#80639f",
  lavender: "#bbb0dc",
  ice: "#dcecf5",
  success: "#2a7564",
  warning: "#8b632e",
  danger: "#a94161",
} as const;

export const LEAD_COLORS: Record<Lead, string> = {
  沈星回: "#a78bfa",
  黎深: "#59b8ff",
  祁煜: "#ff88bf",
  秦徹: "#ff6675",
  夏以晝: "#ffad5c",
};

export const EVENT_COLORS: Record<ScheduleEventType, string> = {
  merch: "#b8df78",
  daily: "#ff78b7",
  monthly: "#9b8cff",
  mixed: "#ffd166",
  birthday: "#ff9f68",
  rerun: "#65d6c4",
  pass: "#ffd34d",
  story: "#66b5ff",
};

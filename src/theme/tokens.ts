import type { Lead, ScheduleEventType } from "@/domain/types";

export const APP_COLORS = {
  canvas: "#7765a7",
  glass: "rgba(56,42,96,0.4)",
  navigation: "rgba(72,42,107,0.62)",
  line: "rgba(255,255,255,0.55)",
  input: "rgba(255,255,255,0.14)",
  text: "#ffffff",
  success: "#7af0c8",
  warning: "#ffe08a",
  danger: "#ff9bb3",
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

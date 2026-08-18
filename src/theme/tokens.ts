import type { Lead, ScheduleEventType } from "@/domain/types";

export const APP_COLORS = {
  canvas: "#7765a7",
  glass: "#493b70",
  navigation: "#60487f",
  text: "#ffffff",
  success: "#65d6c4",
  warning: "#ffd166",
  danger: "#ff6675",
} as const;

export const LEAD_COLORS: Record<Lead, string> = {
  沈星回: "#a78bfa",
  黎深: "#59b8ff",
  祁煜: "#ff88bf",
  秦徹: "#ff6675",
  夏以晝: "#ffad5c",
};

export const EVENT_COLORS: Record<ScheduleEventType, string> = {
  merch: "#49b8ff",
  daily: "#ff78b7",
  monthly: "#9b8cff",
  mixed: "#ffd166",
  birthday: "#ff9f68",
  rerun: "#65d6c4",
  pass: "#ffd34d",
  story: "#66b5ff",
};

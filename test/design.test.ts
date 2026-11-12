import { describe, expect, it } from "vitest";

import { EVENT_LABELS } from "@/domain/schedule";
import { APP_COLORS, EVENT_COLORS, LEAD_COLORS } from "@/theme/tokens";

function luminance(hex: string) {
  const channels = hex.slice(1).match(/../g)!.map(value => parseInt(value, 16) / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
}

describe("02A readability and schedule semantics", () => {
  it("keeps text and semantic status colors readable on the pearl canvas", () => {
    for (const role of ["text", "muted", "accent", "success", "warning", "danger"] as const) {
      const light = luminance(APP_COLORS.canvas), dark = luminance(APP_COLORS[role]);
      expect((Math.max(light, dark) + .05) / (Math.min(light, dark) + .05), role).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("keeps all five lead accents", () => {
    expect(LEAD_COLORS).toEqual({
      沈星回: "#a78bfa",
      黎深: "#59b8ff",
      祁煜: "#ff88bf",
      秦徹: "#ff6675",
      夏以晝: "#ffad5c",
    });
  });

  it("keeps all eight activity labels and accents", () => {
    expect(EVENT_LABELS).toEqual({
      merch: "周邊",
      daily: "日卡池",
      monthly: "月卡池",
      mixed: "混池",
      birthday: "生日池",
      rerun: "復刻池",
      pass: "密約",
      story: "主線分線",
    });
    expect(EVENT_COLORS).toEqual({
      merch: "#b8df78",
      daily: "#ff78b7",
      monthly: "#9b8cff",
      mixed: "#ffd166",
      birthday: "#ff9f68",
      rerun: "#65d6c4",
      pass: "#ffd34d",
      story: "#66b5ff",
    });
  });

});

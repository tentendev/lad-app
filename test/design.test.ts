import { describe, expect, it } from "vitest";

import { EVENT_LABELS } from "@/domain/schedule";
import { APP_COLORS, EVENT_COLORS, LEAD_COLORS } from "@/theme/tokens";

describe("original visual design contract", () => {
  it("keeps the original lavender glass shell colors", () => {
    expect(APP_COLORS).toEqual({
      canvas: "#7765a7",
      glass: "#493b70",
      navigation: "#60487f",
      text: "#ffffff",
      success: "#65d6c4",
      warning: "#ffd166",
      danger: "#ff6675",
    });
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
      merch: "#49b8ff",
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

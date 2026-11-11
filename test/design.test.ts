import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { EVENT_LABELS } from "@/domain/schedule";
import { APP_COLORS, EVENT_COLORS, LEAD_COLORS } from "@/theme/tokens";

describe("original visual design contract", () => {
  it("keeps the original lavender glass shell colors", () => {
    const original = readFileSync(new URL("../index.html", import.meta.url), "utf8");
    const normalize = (value: string) => value.startsWith("rgba(")
      ? `rgba(${value.slice(5, -1).split(",").map(Number).join(",")})`
      : value.trim();
    for (const [name, token] of [["glass", "card"], ["line", "line"], ["text", "txt"], ["success", "good"], ["warning", "warn"], ["danger", "bad"]] as const) {
      const value = original.match(new RegExp(`--${token}:([^;]+);`))?.[1];
      expect(value, `original CSS token --${token}`).toBeDefined();
      expect(APP_COLORS[name]).toBe(normalize(value!));
    }
    const navigation = original.match(/nav\s*\{[^}]*background:([^;]+);/)?.[1];
    expect(navigation).toBeDefined();
    expect(APP_COLORS.navigation).toBe(normalize(navigation!));
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

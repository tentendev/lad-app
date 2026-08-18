import { describe, expect, it } from "vitest";

import {
  assessPullPlanPace,
  canPlanScheduleEvent,
  forecastPullPlan,
  nextPullGoalId,
  nextResourceCheckInId,
  normalizePlannerState,
  normalizePullGoalDraft,
  normalizeResourceCheckInDraft,
  poolForScheduleEvent,
  pullGoalForSourceEvent,
  pullPlanToText,
  scheduleEventToPullGoalDraft,
  summarizeResourceCheckIns,
} from "@/domain/planner";
import type { PlannerState, ScheduleEvent } from "@/domain/types";

const goals: PlannerState = {
  monthlyIncome: 3000,
  goals: [
    { id: 1, title: "第一池", pool: "日卡池", targetPulls: 20, deadline: "2026-09-18", tentative: false, enabled: true, sourceEvent: null },
    { id: 2, title: "第二池", pool: "混池", targetPulls: 50, deadline: "2026-10-18", tentative: true, enabled: true, sourceEvent: "schedule:2" },
  ],
  checkIns: [],
};

describe("planner normalization", () => {
  it("accepts a valid persistent plan and defaults missing legacy data", () => {
    expect(normalizePlannerState(goals)).toEqual(goals);
    expect(normalizePlannerState(undefined)).toEqual({ monthlyIncome: 7060, goals: [], checkIns: [] });
    expect(normalizePlannerState({ monthlyIncome: 7060, goals: [] }).checkIns).toEqual([]);
    expect(normalizePlannerState({
      monthlyIncome: goals.monthlyIncome,
      goals: goals.goals.map(({ enabled: _enabled, ...goal }) => goal),
    }).goals.every((goal) => goal.enabled)).toBe(true);
  });

  it("rejects corrupt or ambiguous goal data", () => {
    expect(() => normalizePlannerState({ ...goals, monthlyIncome: -1 })).toThrow("income");
    expect(() => normalizePlannerState({ ...goals, goals: [goals.goals[0], goals.goals[0]] })).toThrow("id");
    expect(() => normalizePlannerState({ ...goals, goals: [{ ...goals.goals[0], deadline: "2026-99-99" }] })).toThrow("deadline");
    expect(() => normalizePlannerState({ ...goals, goals: [{ ...goals.goals[0], targetPulls: 20.5 }] })).toThrow("target");
    expect(normalizePullGoalDraft({ ...goals.goals[0], targetPulls: 20.9 })?.targetPulls).toBe(20);
  });

  it("allocates monotonic ids after imported data", () => {
    expect(nextPullGoalId(goals.goals, 0, 1)).toBe(3);
  });
});

describe("resource check-ins", () => {
  const checkIns = [
    { id: 10, date: "2026-08-10", diamonds: 1000, tickets: 2, note: "起點" },
    { id: 11, date: "2026-08-15", diamonds: 1500, tickets: 3, note: "活動獎勵" },
    { id: 12, date: "2026-08-21", diamonds: 4000, tickets: 0, note: "未來" },
  ];

  it("normalizes drafts and allocates monotonic timestamp ids", () => {
    expect(normalizeResourceCheckInDraft({ date: "2026-08-19", diamonds: 2000, tickets: 4, note: "  每日  " }))
      .toEqual({ date: "2026-08-19", diamonds: 2000, tickets: 4, note: "每日" });
    expect(normalizeResourceCheckInDraft({ date: "2026-08-19", diamonds: -1, tickets: 0, note: "" })).toBeNull();
    expect(nextResourceCheckInId(checkIns, 0, 1_787_080_000_000)).toBe(1_787_080_000_000);
  });

  it("compares the latest two completed check-in days and ignores future entries", () => {
    expect(summarizeResourceCheckIns(checkIns, "2026-08-19")).toEqual({
      latest: checkIns[1],
      previous: checkIns[0],
      latestEquivalentDia: 1950,
      changeEquivalentDia: 650,
      daysBetween: 5,
      averageDailyChange: 130,
    });
  });

  it("rejects ambiguous duplicate check-in dates in stored data", () => {
    expect(() => normalizePlannerState({
      monthlyIncome: 7060,
      goals: [],
      checkIns: [checkIns[0], { ...checkIns[0], id: 99 }],
    })).toThrow("duplicated");
  });

  it("compares observed daily resource growth with the next short goal", () => {
    const forecast = forecastPullPlan(
      { monthlyIncome: 0, goals: [{ ...goals.goals[0], targetPulls: 40, deadline: "2026-08-29" }], checkIns: [] },
      { currentDia: 0, currentTickets: 0 },
      "2026-08-19",
    );
    const summary = summarizeResourceCheckIns(checkIns, "2026-08-19");
    expect(assessPullPlanPace(forecast, summary)).toMatchObject({
      status: "behind",
      plannedDailyDia: 0,
      additionalDailyDia: 405,
      requiredDailyDia: 405,
      actualDailyDia: 130,
      dailyDelta: -275,
      target: { goal: { title: "第一池" } },
    });
    expect(assessPullPlanPace(forecast, summarizeResourceCheckIns([checkIns[0]], "2026-08-19")).status).toBe("unknown");
    expect(assessPullPlanPace({ ...forecast, goals: forecast.goals.map((item) => ({ ...item, status: "safe" as const })) }, summary).status).toBe("safe");
  });

  it("compares actual growth with total planned daily growth, not only the extra shortfall", () => {
    const forecast = forecastPullPlan(
      { monthlyIncome: 3000, goals: [{ ...goals.goals[0], targetPulls: 40, deadline: "2026-08-29" }], checkIns: [] },
      { currentDia: 0, currentTickets: 0 },
      "2026-08-19",
    );
    const pace = assessPullPlanPace(forecast, summarizeResourceCheckIns(checkIns, "2026-08-19"));
    expect(pace).toMatchObject({
      status: "behind",
      plannedDailyDia: 98.5,
      additionalDailyDia: 307,
      requiredDailyDia: 405,
      actualDailyDia: 130,
      dailyDelta: -275,
    });
  });
});

describe("multi-event forecast", () => {
  it("uses current tickets once and carries the remaining balance through later goals", () => {
    const result = forecastPullPlan(goals, { currentDia: 1500, currentTickets: 2 }, "2026-08-19");

    expect(result.startingDia).toBe(1800);
    expect(result.peakShortfallDia).toBe(0);
    expect(result.goals[0]).toMatchObject({
      incomeBeforeGoal: 2956,
      officialTickets: 11,
      requiredDia: 1350,
      balanceAfterGoal: 3406,
      status: "safe",
    });
    expect(result.goals[1]).toMatchObject({
      incomeBeforeGoal: 2956,
      officialTickets: 10,
      requiredDia: 6000,
      balanceAfterGoal: 362,
      status: "safe",
    });
    expect(result.endingDia).toBe(362);
  });

  it("shows cumulative shortfall and the additional daily pace without urgency copy", () => {
    const result = forecastPullPlan(
      { monthlyIncome: 0, goals: [{ ...goals.goals[0], targetPulls: 40, deadline: "2026-08-29" }], checkIns: [] },
      { currentDia: 0, currentTickets: 0 },
      "2026-08-19",
    );
    expect(result.goals[0]).toMatchObject({ shortfallDia: 4050, additionalDailyDia: 405, status: "short" });
    expect(result.peakShortfallDia).toBe(4050);
  });

  it("retains an earlier funding gap even when later income makes the ending balance positive", () => {
    const result = forecastPullPlan({
      monthlyIncome: 30_000,
      goals: [
        { ...goals.goals[0], targetPulls: 40, deadline: "2026-08-20" },
        { ...goals.goals[1], pool: "日卡池", targetPulls: 1, deadline: "2026-10-20" },
      ],
      checkIns: [],
    }, { currentDia: 0, currentTickets: 0 }, "2026-08-19");
    expect(result.goals[0].status).toBe("short");
    expect(result.peakShortfallDia).toBe(result.goals[0].shortfallDia);
    expect(result.endingDia).toBeGreaterThan(0);
  });

  it("keeps ended goals visible without charging them against the future forecast", () => {
    const result = forecastPullPlan(
      { monthlyIncome: 3000, goals: [{ ...goals.goals[0], deadline: "2026-08-18" }, goals.goals[1]], checkIns: [] },
      { currentDia: 1500, currentTickets: 0 },
      "2026-08-19",
    );
    expect(result.goals[0].status).toBe("past");
    expect(result.goals[0].balanceAfterGoal).toBe(1500);
    expect(result.goals[1].balanceBeforeGoal).toBeGreaterThan(1500);
  });

  it("creates a privacy-safe share summary for each scenario state", () => {
    const forecast = forecastPullPlan({
      ...goals,
      goals: [{ ...goals.goals[0], enabled: false }, goals.goals[1]],
    }, { currentDia: 0, currentTickets: 0 }, "2026-08-19");
    const text = pullPlanToText(forecast);
    expect(text).toContain("起點：0 鑽等值｜每月可存：3,000 鑽");
    expect(text).toContain("1. 第一池｜2026-09-18｜20 抽｜情境暫停，不扣資源");
    expect(text).toContain("2. 第二池｜2026-10-18｜50 抽｜仍差 88 鑽（補足估算 NT$15／1 抽／至第 一 階）");
    expect(text).toContain("全程資金缺口：至少另備 88 鑽等值");
    expect(text).toContain("不重複計算官方金券");
    expect(text).not.toContain("sourceEvent");
  });

  it("keeps an overflow pack ceiling actionable in the shared summary", () => {
    const forecast = forecastPullPlan({
      monthlyIncome: 0,
      goals: [{ id: 99, title: "極端復刻目標", pool: "復刻池", targetPulls: 667, deadline: "2026-08-19", tentative: false, enabled: true, sourceEvent: null }],
      checkIns: [],
    }, { currentDia: 0, currentTickets: 0 }, "2026-08-19");
    expect(pullPlanToText(forecast)).toContain("單輪限購最多估算 NT$11,450／306 抽，尚餘 361 抽需另備資源");
  });
});

describe("schedule handoff", () => {
  it("maps pull events and leaves non-pull events out of the planner", () => {
    const event: ScheduleEvent = { name: "新混池", type: "mixed", start: "2026-09-07", end: "2026-09-22", tentative: true };
    expect(poolForScheduleEvent(event)).toBe("混池");
    expect(scheduleEventToPullGoalDraft(event)).toEqual({
      title: "新混池",
      pool: "混池",
      targetPulls: 0,
      deadline: "2026-09-22",
      tentative: true,
      enabled: true,
      sourceEvent: "2026-09-07:mixed:新混池",
    });
    expect(scheduleEventToPullGoalDraft({ ...event, type: "story" })).toBeNull();
    expect(canPlanScheduleEvent(event, "2026-09-22")).toBe(true);
    expect(canPlanScheduleEvent(event, "2026-09-23")).toBe(false);
    expect(canPlanScheduleEvent({ ...event, type: "story" }, "2026-09-01")).toBe(false);
    expect(pullGoalForSourceEvent(goals.goals, "schedule:2")?.title).toBe("第二池");
    expect(pullGoalForSourceEvent(goals.goals, null)).toBeNull();
  });
});

describe("planning scenarios", () => {
  it("keeps time income but does not charge a paused goal", () => {
    const result = forecastPullPlan({
      ...goals,
      goals: [{ ...goals.goals[0], enabled: false }, goals.goals[1]],
    }, { currentDia: 0, currentTickets: 0 }, "2026-08-19");
    expect(result.goals[0]).toMatchObject({ status: "skipped", balanceAfterGoal: 2956 });
    expect(result.goals[1]).toMatchObject({ incomeBeforeGoal: 2956, balanceAfterGoal: -88 });
  });
});

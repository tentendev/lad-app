import { DIA_PER_PULL, MONTHLY_DIA } from "@/data/packs";
import { officialTicketCount, recommendPacksForGap } from "@/domain/calculator";
import { formatNumber, isValidDateKey } from "@/domain/format";
import { POOLS } from "@/domain/types";
import type { PlannerState, Pool, PullGoal, PullGoalDraft, ResourceCheckIn, ResourceCheckInDraft, ScheduleEvent } from "@/domain/types";

const AVERAGE_DAYS_PER_YEAR = 365.2425;
const MAX_GOALS = 200;
const MAX_TITLE_LENGTH = 120;
const MAX_CHECK_INS = 2_000;
const MAX_NOTE_LENGTH = 120;

export const DEFAULT_PLANNER_STATE: PlannerState = {
  monthlyIncome: MONTHLY_DIA,
  goals: [],
  checkIns: [],
};

export type ResourceCheckInSummary = {
  latest: ResourceCheckIn | null;
  previous: ResourceCheckIn | null;
  latestEquivalentDia: number;
  changeEquivalentDia: number | null;
  daysBetween: number | null;
  averageDailyChange: number | null;
};

export type GoalForecast = {
  goal: PullGoal;
  daysFromPrevious: number;
  daysRemaining: number;
  incomeBeforeGoal: number;
  officialTickets: number;
  requiredDia: number;
  balanceBeforeGoal: number;
  balanceAfterGoal: number;
  shortfallDia: number;
  additionalDailyDia: number;
  status: "past" | "skipped" | "safe" | "short";
};

export type PullPlanForecast = {
  startingDia: number;
  monthlyIncome: number;
  goals: GoalForecast[];
  peakShortfallDia: number;
  endingDia: number;
};

export type PullPlanPace = {
  status: "safe" | "unknown" | "on-track" | "behind";
  target: GoalForecast | null;
  plannedDailyDia: number;
  additionalDailyDia: number;
  requiredDailyDia: number;
  actualDailyDia: number | null;
  dailyDelta: number | null;
};

export function assessPullPlanPace(
  forecast: PullPlanForecast,
  checkInSummary: ResourceCheckInSummary,
): PullPlanPace {
  const target = forecast.goals.find((item) => item.status === "short") ?? null;
  if (!target) {
    return {
      status: "safe",
      target: null,
      plannedDailyDia: 0,
      additionalDailyDia: 0,
      requiredDailyDia: 0,
      actualDailyDia: checkInSummary.averageDailyChange,
      dailyDelta: null,
    };
  }
  const targetIndex = forecast.goals.findIndex((item) => item === target);
  const daysRemaining = Math.max(1, target.daysRemaining);
  const plannedIncomeThroughTarget = forecast.goals
    .slice(0, targetIndex + 1)
    .reduce((total, item) => total + item.incomeBeforeGoal, 0);
  const plannedDailyDia = Math.round((plannedIncomeThroughTarget / daysRemaining) * 10) / 10;
  const requiredDailyDia = Math.round(((plannedIncomeThroughTarget + target.shortfallDia) / daysRemaining) * 10) / 10;
  const actualDailyDia = checkInSummary.averageDailyChange;
  if (actualDailyDia === null) {
    return {
      status: "unknown",
      target,
      plannedDailyDia,
      additionalDailyDia: target.additionalDailyDia,
      requiredDailyDia,
      actualDailyDia: null,
      dailyDelta: null,
    };
  }
  const dailyDelta = Math.round((actualDailyDia - requiredDailyDia) * 10) / 10;
  return {
    status: dailyDelta >= 0 ? "on-track" : "behind",
    target,
    plannedDailyDia,
    additionalDailyDia: target.additionalDailyDia,
    requiredDailyDia,
    actualDailyDia,
    dailyDelta,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeNonNegative(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.min(value, Number.MAX_SAFE_INTEGER)
    : 0;
}

function utcDate(dateKey: string): number {
  const [year, month, day] = dateKey.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function dayDistance(later: string, earlier: string): number {
  return Math.round((utcDate(later) - utcDate(earlier)) / 86_400_000);
}

function parseGoal(value: unknown, ids: Set<number>): PullGoal {
  if (!isRecord(value)) throw new Error("stored planner goal is invalid");
  const id = value.id;
  const title = typeof value.title === "string" ? value.title.trim() : "";
  const pool = value.pool;
  const targetPulls = value.targetPulls;
  const sourceEvent = value.sourceEvent;

  if (typeof id !== "number" || !Number.isSafeInteger(id) || id <= 0 || ids.has(id)) {
    throw new Error("stored planner goal id is invalid");
  }
  if (!title || title.length > MAX_TITLE_LENGTH) throw new Error("stored planner goal title is invalid");
  if (typeof pool !== "string" || !POOLS.includes(pool as Pool)) throw new Error("stored planner pool is invalid");
  if (typeof targetPulls !== "number" || !Number.isSafeInteger(targetPulls) || targetPulls <= 0) {
    throw new Error("stored planner target is invalid");
  }
  if (typeof value.deadline !== "string" || !isValidDateKey(value.deadline)) {
    throw new Error("stored planner deadline is invalid");
  }
  if (typeof value.tentative !== "boolean") throw new Error("stored planner status is invalid");
  if (value.enabled !== undefined && typeof value.enabled !== "boolean") throw new Error("stored planner enabled state is invalid");
  if (sourceEvent !== null && (typeof sourceEvent !== "string" || sourceEvent.length > 240)) {
    throw new Error("stored planner source is invalid");
  }

  ids.add(id);
  return {
    id,
    title,
    pool: pool as Pool,
    targetPulls,
    deadline: value.deadline,
    tentative: value.tentative,
    enabled: value.enabled !== false,
    sourceEvent: sourceEvent as string | null,
  };
}

function parseCheckIn(value: unknown, ids: Set<number>): ResourceCheckIn {
  if (!isRecord(value)) throw new Error("stored planner check-in is invalid");
  const { id, diamonds, tickets } = value;
  if (typeof id !== "number" || !Number.isSafeInteger(id) || id <= 0 || ids.has(id)) {
    throw new Error("stored planner check-in id is invalid");
  }
  if (typeof value.date !== "string" || !isValidDateKey(value.date)) {
    throw new Error("stored planner check-in date is invalid");
  }
  if (typeof diamonds !== "number" || !Number.isSafeInteger(diamonds) || diamonds < 0) {
    throw new Error("stored planner check-in diamonds are invalid");
  }
  if (typeof tickets !== "number" || !Number.isSafeInteger(tickets) || tickets < 0) {
    throw new Error("stored planner check-in tickets are invalid");
  }
  if (typeof value.note !== "string" || value.note.length > MAX_NOTE_LENGTH) {
    throw new Error("stored planner check-in note is invalid");
  }
  ids.add(id);
  return { id, date: value.date, diamonds, tickets, note: value.note.trim() };
}

export function normalizePlannerState(value: unknown): PlannerState {
  if (value == null) return DEFAULT_PLANNER_STATE;
  if (!isRecord(value)) throw new Error("stored planner is invalid");
  if (typeof value.monthlyIncome !== "number" || !Number.isFinite(value.monthlyIncome) || value.monthlyIncome < 0) {
    throw new Error("stored planner income is invalid");
  }
  if (!Array.isArray(value.goals) || value.goals.length > MAX_GOALS) {
    throw new Error("stored planner goals are invalid");
  }
  const ids = new Set<number>();
  const checkInIds = new Set<number>();
  const checkInDates = new Set<string>();
  const checkIns = value.checkIns ?? [];
  if (!Array.isArray(checkIns) || checkIns.length > MAX_CHECK_INS) {
    throw new Error("stored planner check-ins are invalid");
  }
  const normalizedCheckIns = checkIns.map((checkIn) => parseCheckIn(checkIn, checkInIds));
  for (const checkIn of normalizedCheckIns) {
    if (checkInDates.has(checkIn.date)) throw new Error("stored planner check-in date is duplicated");
    checkInDates.add(checkIn.date);
  }
  return {
    monthlyIncome: Math.min(value.monthlyIncome, Number.MAX_SAFE_INTEGER),
    goals: value.goals.map((goal) => parseGoal(goal, ids)),
    checkIns: normalizedCheckIns,
  };
}

export function normalizeResourceCheckInDraft(value: unknown): ResourceCheckInDraft | null {
  if (!isRecord(value) || typeof value.date !== "string" || !isValidDateKey(value.date)) return null;
  if (typeof value.diamonds !== "number" || !Number.isSafeInteger(value.diamonds) || value.diamonds < 0) return null;
  if (typeof value.tickets !== "number" || !Number.isSafeInteger(value.tickets) || value.tickets < 0) return null;
  if (typeof value.note !== "string" || value.note.trim().length > MAX_NOTE_LENGTH) return null;
  return { date: value.date, diamonds: value.diamonds, tickets: value.tickets, note: value.note.trim() };
}

export function nextResourceCheckInId(checkIns: ResourceCheckIn[], lastIssued = 0, now = Date.now()): number {
  const largestStored = checkIns.reduce((largest, checkIn) => Math.max(largest, checkIn.id), 0);
  return Math.max(Math.floor(now), Math.floor(lastIssued) + 1, largestStored + 1);
}

export function summarizeResourceCheckIns(checkIns: ResourceCheckIn[], today: string): ResourceCheckInSummary {
  if (!isValidDateKey(today)) throw new Error("check-in summary date is invalid");
  const relevant = [...checkIns]
    .filter((checkIn) => checkIn.date <= today)
    .sort((left, right) => right.date.localeCompare(left.date) || right.id - left.id);
  const latest = relevant[0] ?? null;
  const previous = relevant.find((checkIn) => checkIn.date < (latest?.date ?? "")) ?? null;
  const latestEquivalentDia = latest ? latest.diamonds + latest.tickets * DIA_PER_PULL : 0;
  const previousEquivalentDia = previous ? previous.diamonds + previous.tickets * DIA_PER_PULL : 0;
  const changeEquivalentDia = latest && previous ? latestEquivalentDia - previousEquivalentDia : null;
  const daysBetween = latest && previous ? dayDistance(latest.date, previous.date) : null;
  return {
    latest,
    previous,
    latestEquivalentDia,
    changeEquivalentDia,
    daysBetween,
    averageDailyChange: changeEquivalentDia !== null && daysBetween
      ? Math.round((changeEquivalentDia / daysBetween) * 10) / 10
      : null,
  };
}

export function normalizePullGoalDraft(value: unknown): PullGoalDraft | null {
  if (!isRecord(value)) return null;
  const title = typeof value.title === "string" ? value.title.trim() : "";
  const pool = value.pool;
  const targetPulls = Math.floor(safeNonNegative(value.targetPulls));
  const sourceEvent = value.sourceEvent;
  if (!title || title.length > MAX_TITLE_LENGTH) return null;
  if (typeof pool !== "string" || !POOLS.includes(pool as Pool)) return null;
  if (typeof value.deadline !== "string" || !isValidDateKey(value.deadline)) return null;
  if (typeof value.tentative !== "boolean") return null;
  if (value.enabled !== undefined && typeof value.enabled !== "boolean") return null;
  if (sourceEvent !== null && (typeof sourceEvent !== "string" || sourceEvent.length > 240)) return null;
  return {
    title,
    pool: pool as Pool,
    targetPulls,
    deadline: value.deadline,
    tentative: value.tentative,
    enabled: value.enabled !== false,
    sourceEvent: sourceEvent as string | null,
  };
}

export function nextPullGoalId(goals: PullGoal[], lastIssued = 0, now = Date.now()): number {
  const largestStored = goals.reduce((largest, goal) => Math.max(largest, goal.id), 0);
  return Math.max(Math.floor(now), Math.floor(lastIssued) + 1, largestStored + 1);
}

export function pullGoalForSourceEvent(goals: PullGoal[], sourceEvent: string | null): PullGoal | null {
  if (!sourceEvent) return null;
  return goals.find((goal) => goal.sourceEvent === sourceEvent) ?? null;
}

export function poolForScheduleEvent(event: ScheduleEvent): Pool | null {
  const pools: Partial<Record<ScheduleEvent["type"], Pool>> = {
    daily: "日卡池",
    mixed: "混池",
    monthly: "月卡池",
    birthday: "生日池",
    rerun: "復刻池",
  };
  return pools[event.type] ?? null;
}

export function canPlanScheduleEvent(event: ScheduleEvent, today: string): boolean {
  if (!isValidDateKey(today)) return false;
  return poolForScheduleEvent(event) !== null && (event.end || event.start) >= today;
}

export function scheduleEventToPullGoalDraft(event: ScheduleEvent): PullGoalDraft | null {
  const pool = poolForScheduleEvent(event);
  if (!pool) return null;
  return {
    title: event.name,
    pool,
    targetPulls: 0,
    deadline: event.end || event.start,
    tentative: event.tentative,
    enabled: true,
    sourceEvent: `${event.start}:${event.type}:${event.name}`,
  };
}

export function forecastPullPlan(
  planner: PlannerState,
  resources: { currentDia: number; currentTickets: number },
  today: string,
): PullPlanForecast {
  if (!isValidDateKey(today)) throw new Error("forecast date is invalid");
  const normalized = normalizePlannerState(planner);
  const startingDia = safeNonNegative(resources.currentDia) + safeNonNegative(resources.currentTickets) * DIA_PER_PULL;
  const dailyIncome = normalized.monthlyIncome * 12 / AVERAGE_DAYS_PER_YEAR;
  const sortedGoals = [...normalized.goals].sort((a, b) => a.deadline.localeCompare(b.deadline) || a.id - b.id);
  let balance = startingDia;
  let previousDeadline = today;

  const goals = sortedGoals.map((goal): GoalForecast => {
    const daysRemaining = dayDistance(goal.deadline, today);
    const isPast = daysRemaining < 0;
    const daysFromPrevious = isPast ? 0 : Math.max(0, dayDistance(goal.deadline, previousDeadline));
    const incomeBeforeGoal = isPast ? 0 : Math.floor(daysFromPrevious * dailyIncome);
    const officialTickets = officialTicketCount(goal.pool, goal.targetPulls);
    const requiredDia = Math.max(0, goal.targetPulls - officialTickets) * DIA_PER_PULL;
    const balanceBeforeGoal = balance + incomeBeforeGoal;

    if (isPast) {
      return {
        goal,
        daysFromPrevious,
        daysRemaining,
        incomeBeforeGoal,
        officialTickets,
        requiredDia,
        balanceBeforeGoal: balance,
        balanceAfterGoal: balance,
        shortfallDia: 0,
        additionalDailyDia: 0,
        status: "past",
      };
    }


    if (!goal.enabled) {
      balance = balanceBeforeGoal;
      previousDeadline = goal.deadline > previousDeadline ? goal.deadline : previousDeadline;
      return {
        goal,
        daysFromPrevious,
        daysRemaining,
        incomeBeforeGoal,
        officialTickets,
        requiredDia,
        balanceBeforeGoal,
        balanceAfterGoal: balance,
        shortfallDia: 0,
        additionalDailyDia: 0,
        status: "skipped",
      };
    }

    balance = balanceBeforeGoal - requiredDia;
    previousDeadline = goal.deadline > previousDeadline ? goal.deadline : previousDeadline;
    const shortfallDia = Math.max(0, -balance);
    return {
      goal,
      daysFromPrevious,
      daysRemaining,
      incomeBeforeGoal,
      officialTickets,
      requiredDia,
      balanceBeforeGoal,
      balanceAfterGoal: balance,
      shortfallDia,
      additionalDailyDia: shortfallDia > 0 ? Math.ceil(shortfallDia / Math.max(1, daysRemaining)) : 0,
      status: shortfallDia > 0 ? "short" : "safe",
    };
  });

  return {
    startingDia,
    monthlyIncome: normalized.monthlyIncome,
    goals,
    peakShortfallDia: goals.reduce((largest, item) => Math.max(largest, item.shortfallDia), 0),
    endingDia: balance,
  };
}

export function pullPlanToText(forecast: PullPlanForecast): string {
  const lines = [
    "深空省省｜活動抽卡規劃",
    `起點：${formatNumber(forecast.startingDia)} 鑽等值｜每月可存：${formatNumber(forecast.monthlyIncome)} 鑽`,
  ];
  forecast.goals.forEach((item, index) => {
    const gapPlan = recommendPacksForGap(item.goal.pool, item.shortfallDia);
    const outcome = item.status === "past"
      ? "已結束，不影響後續"
      : item.status === "skipped"
        ? "情境暫停，不扣資源"
        : item.status === "short"
          ? gapPlan.status === "recommended"
            ? `仍差 ${formatNumber(item.shortfallDia)} 鑽（補足估算 NT$${formatNumber(gapPlan.planCost ?? 0)}／${formatNumber(gapPlan.planPulls ?? 0)} 抽／至第 ${gapPlan.tier?.tier} 階）`
            : `仍差 ${formatNumber(item.shortfallDia)} 鑽（單輪限購最多估算 NT$${formatNumber(gapPlan.planCost ?? 0)}／${formatNumber(gapPlan.planPulls ?? 0)} 抽，尚餘 ${formatNumber(Math.max(0, gapPlan.gapPulls - (gapPlan.planPulls ?? 0)))} 抽需另備資源）`
          : `完成後剩 ${formatNumber(item.balanceAfterGoal)} 鑽`;
    lines.push(`${index + 1}. ${item.goal.title}｜${item.goal.deadline}｜${formatNumber(item.goal.targetPulls)} 抽｜${outcome}`);
  });
  if (forecast.goals.length) {
    lines.push(forecast.peakShortfallDia > 0
      ? `全程資金缺口：至少另備 ${formatNumber(forecast.peakShortfallDia)} 鑽等值，才能讓每個啟用目標按期達成。`
      : `全程結果：啟用目標皆可按期達成，最後預計剩 ${formatNumber(forecast.endingDia)} 鑽。`);
  }
  lines.push("各目標補足估算獨立呈現，未假設前一項已購買，且不重複計算官方金券；實際價格、卡池與獲取規則請以遊戲公告為準。");
  return lines.join("\n");
}

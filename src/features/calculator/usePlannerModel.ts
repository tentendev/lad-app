import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { storage } from "@/data/repositories/storage";
import { STORAGE_KEYS } from "@/data/repositories/storage.types";
import { todayKey } from "@/domain/format";
import {
  DEFAULT_PLANNER_STATE,
  assessPullPlanPace,
  forecastPullPlan,
  nextPullGoalId,
  nextResourceCheckInId,
  normalizePlannerState,
  normalizePullGoalDraft,
  normalizeResourceCheckInDraft,
  pullGoalForSourceEvent,
  summarizeResourceCheckIns,
} from "@/domain/planner";
import type { PlannerState, PullGoal, PullGoalDraft, ResourceCheckIn, ResourceCheckInDraft } from "@/domain/types";

function emptyGoalDraft(): PullGoalDraft {
  return {
    title: "",
    pool: "日卡池",
    targetPulls: 0,
    deadline: "",
    tentative: false,
    enabled: true,
    sourceEvent: null,
  };
}

export function usePlannerModel(resources: { currentDia: number; currentTickets: number }) {
  const [planner, setPlanner] = useState<PlannerState>(DEFAULT_PLANNER_STATE);
  const [goalDraft, setGoalDraft] = useState<PullGoalDraft>(emptyGoalDraft);
  const [incomeDraft, setIncomeDraft] = useState(String(DEFAULT_PLANNER_STATE.monthlyIncome));
  const [editingId, setEditingId] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [writeProtected, setWriteProtected] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [handoffNotice, setHandoffNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [checkInError, setCheckInError] = useState<string | null>(null);
  const lastGoalId = useRef(0);
  const lastCheckInId = useRef(0);
  const writeInFlight = useRef(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const [storedPlanner, pendingGoal] = await Promise.all([
          storage.get<unknown>(STORAGE_KEYS.planner, null),
          storage.get<unknown>(STORAGE_KEYS.pendingPullGoal, null),
        ]);
        if (!active) return;
        const normalized = normalizePlannerState(storedPlanner);
        const pending = normalizePullGoalDraft(pendingGoal);
        lastGoalId.current = normalized.goals.reduce((largest, goal) => Math.max(largest, goal.id), 0);
        lastCheckInId.current = normalized.checkIns.reduce((largest, checkIn) => Math.max(largest, checkIn.id), 0);
        setPlanner(normalized);
        setIncomeDraft(String(normalized.monthlyIncome));
        if (pending) {
          const existing = pullGoalForSourceEvent(normalized.goals, pending.sourceEvent);
          if (existing) {
            const { id, ...draft } = existing;
            setEditingId(id);
            setGoalDraft(draft);
            setHandoffNotice("這項排期已在規劃中，已開啟原目標供你確認或修改。");
          } else {
            setGoalDraft(pending);
          }
        }
        setWriteProtected(false);
        setStorageError(null);
        if (pendingGoal !== null) await storage.remove(STORAGE_KEYS.pendingPullGoal);
      } catch (error) {
        if (!active) return;
        setWriteProtected(true);
        setStorageError(
          error instanceof Error && error.message.startsWith("stored planner")
            ? "裝置內的抽卡規劃格式異常。為避免覆蓋，規劃已暫停寫入；Web 請先從關於頁下載原始救援檔。"
            : "無法讀寫這台裝置的抽卡規劃。請確認仍有可用儲存空間後再試一次。",
        );
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const forecast = useMemo(
    () => forecastPullPlan(planner, resources, todayKey()),
    [planner, resources],
  );
  const checkInSummary = useMemo(
    () => summarizeResourceCheckIns(planner.checkIns, todayKey()),
    [planner.checkIns],
  );
  const pace = useMemo(() => assessPullPlanPace(forecast, checkInSummary), [checkInSummary, forecast]);

  const persist = useCallback(async (next: PlannerState, failureMessage: string): Promise<boolean> => {
    if (writeProtected || writeInFlight.current) return false;
    writeInFlight.current = true;
    setBusy(true);
    try {
      await storage.set(STORAGE_KEYS.planner, next);
      setPlanner(next);
      setStorageError(null);
      return true;
    } catch {
      setStorageError(failureMessage);
      return false;
    } finally {
      writeInFlight.current = false;
      setBusy(false);
    }
  }, [writeProtected]);

  const saveMonthlyIncome = useCallback(async (): Promise<boolean> => {
    const value = Number(incomeDraft);
    if (!Number.isFinite(value) || value < 0) {
      setFormError("每月可存鑽石需為 0 或正數。");
      return false;
    }
    const saved = await persist(
      { ...planner, monthlyIncome: Math.min(value, Number.MAX_SAFE_INTEGER) },
      "每月存鑽設定尚未儲存。請確認裝置儲存空間後再試一次。",
    );
    if (saved) setFormError(null);
    return saved;
  }, [incomeDraft, persist, planner]);

  const updateIncomeDraft = useCallback((value: string) => {
    setIncomeDraft(value);
    setFormError(null);
  }, []);

  const updateGoalDraft = useCallback(<Key extends keyof PullGoalDraft>(key: Key, value: PullGoalDraft[Key]) => {
    setGoalDraft((current) => ({ ...current, [key]: value }));
    setFormError(null);
  }, []);

  const saveGoal = useCallback(async (): Promise<boolean> => {
    const normalized = normalizePullGoalDraft(goalDraft);
    if (!normalized || normalized.targetPulls <= 0) {
      setFormError("請填寫規劃名稱、有效截止日與大於 0 的目標抽數。");
      return false;
    }

    const existingSourceGoal = editingId === null
      ? pullGoalForSourceEvent(planner.goals, normalized.sourceEvent)
      : null;
    if (existingSourceGoal) {
      const { id, ...draft } = existingSourceGoal;
      setEditingId(id);
      setGoalDraft(draft);
      setHandoffNotice("這項排期已在規劃中，已開啟原目標供你確認或修改。");
      setFormError(null);
      return false;
    }

    let goals: PullGoal[];
    if (editingId !== null) {
      goals = planner.goals.map((goal) => goal.id === editingId ? { ...normalized, id: editingId } : goal);
    } else {
      const id = nextPullGoalId(planner.goals, lastGoalId.current);
      lastGoalId.current = id;
      goals = [...planner.goals, { ...normalized, id }];
    }
    const saved = await persist(
      { ...planner, goals },
      "這項抽卡目標尚未儲存。請確認裝置儲存空間後再試一次。",
    );
    if (saved) {
      setGoalDraft(emptyGoalDraft());
      setEditingId(null);
      setHandoffNotice(null);
      setFormError(null);
    }
    return saved;
  }, [editingId, goalDraft, persist, planner]);

  const startEditing = useCallback((goal: PullGoal) => {
    const { id, ...draft } = goal;
    setEditingId(id);
    setGoalDraft(draft);
    setFormError(null);
    setHandoffNotice(null);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingId(null);
    setGoalDraft(emptyGoalDraft());
    setFormError(null);
    setHandoffNotice(null);
  }, []);

  const deleteGoal = useCallback(async (id: number): Promise<boolean> => {
    const saved = await persist(
      { ...planner, goals: planner.goals.filter((goal) => goal.id !== id) },
      "這項抽卡目標尚未刪除。請確認裝置儲存空間後再試一次。",
    );
    if (saved && editingId === id) cancelEditing();
    return saved;
  }, [cancelEditing, editingId, persist, planner]);

  const restoreGoal = useCallback(async (goal: PullGoal): Promise<boolean> => {
    const goals = [...planner.goals.filter((item) => item.id !== goal.id), goal];
    return persist(
      { ...planner, goals },
      "這項抽卡目標尚未復原。請確認裝置儲存空間後再試一次。",
    );
  }, [persist, planner]);

  const toggleGoal = useCallback(async (id: number): Promise<boolean> => persist(
    { ...planner, goals: planner.goals.map((goal) => goal.id === id ? { ...goal, enabled: !goal.enabled } : goal) },
    "這項抽卡目標的情境狀態尚未更新。請確認裝置儲存空間後再試一次。",
  ), [persist, planner]);

  const saveCheckIn = useCallback(async (draft: ResourceCheckInDraft): Promise<boolean> => {
    const normalized = normalizeResourceCheckInDraft(draft);
    if (!normalized || writeProtected) {
      setCheckInError("請填寫有效日期，以及 0 或正整數的鑽石與金券數量。");
      return false;
    }
    const existing = planner.checkIns.find((checkIn) => checkIn.date === normalized.date);
    const checkIn = existing
      ? { ...normalized, id: existing.id }
      : { ...normalized, id: nextResourceCheckInId(planner.checkIns, lastCheckInId.current) };
    lastCheckInId.current = Math.max(lastCheckInId.current, checkIn.id);
    const saved = await persist(
      { ...planner, checkIns: [checkIn, ...planner.checkIns.filter((item) => item.id !== checkIn.id)] },
      "這筆資源進度尚未儲存。請確認裝置儲存空間後再試一次。",
    );
    if (saved) setCheckInError(null);
    return saved;
  }, [persist, planner, writeProtected]);

  const deleteCheckIn = useCallback(async (id: number): Promise<boolean> => persist(
    { ...planner, checkIns: planner.checkIns.filter((checkIn) => checkIn.id !== id) },
    "這筆資源進度尚未刪除。請確認裝置儲存空間後再試一次。",
  ), [persist, planner]);

  const restoreCheckIn = useCallback(async (checkIn: ResourceCheckIn): Promise<boolean> => persist(
    { ...planner, checkIns: [checkIn, ...planner.checkIns.filter((item) => item.id !== checkIn.id)] },
    "這筆資源進度尚未復原。請確認裝置儲存空間後再試一次。",
  ), [persist, planner]);

  const clearCheckInError = useCallback(() => setCheckInError(null), []);

  return {
    ready,
    busy,
    writeProtected,
    planner,
    forecast,
    checkInSummary,
    pace,
    goalDraft,
    incomeDraft,
    editingId,
    storageError,
    handoffNotice,
    formError,
    checkInError,
    setIncomeDraft: updateIncomeDraft,
    saveMonthlyIncome,
    updateGoalDraft,
    saveGoal,
    startEditing,
    cancelEditing,
    deleteGoal,
    restoreGoal,
    toggleGoal,
    saveCheckIn,
    deleteCheckIn,
    restoreCheckIn,
    clearCheckInError,
  };
}

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { calculateResources, DEFAULT_CALCULATOR_DRAFT, normalizeCalculatorDraft, normalizePendingCalculatorTarget, recommendPacks } from "@/domain/calculator";
import { todayKey } from "@/domain/format";
import type { CalculatorDraft, PendingExpense, Pool, ReserveUnit } from "@/domain/types";
import { storage } from "@/data/repositories/storage";
import { STORAGE_KEYS } from "@/data/repositories/storage.types";
import { DIA_PER_PULL } from "@/data/packs";

export function useCalculatorModel() {
  const [draft, setDraft] = useState<CalculatorDraft>(DEFAULT_CALCULATOR_DRAFT);
  const [ready, setReady] = useState(false);
  const [persistenceEnabled, setPersistenceEnabled] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [targetHandoff, setTargetHandoff] = useState<string | null>(null);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const saveRevision = useRef(0);

  useEffect(() => {
    let active = true;
    void Promise.all([
      storage.get<unknown>(STORAGE_KEYS.calculator, DEFAULT_CALCULATOR_DRAFT),
      storage.get<unknown>(STORAGE_KEYS.pendingCalculatorTarget, null),
    ])
      .then(async ([stored, pendingValue]) => {
        if (!active) return;
        const normalized = normalizeCalculatorDraft(stored);
        const pending = normalizePendingCalculatorTarget(pendingValue);
        setDraft(pending ? {
          ...normalized,
          pool: pending.pool ?? (normalized.pool === "復刻池" ? "日卡池" : normalized.pool),
          pulls: pending.pulls,
        } : normalized);
        setTargetHandoff(pending?.source ?? null);
        setPersistenceEnabled(true);
        setStorageError(null);
        if (pendingValue !== null) await storage.remove(STORAGE_KEYS.pendingCalculatorTarget);
      })
      .catch(() => {
        if (active) {
          setPersistenceEnabled(false);
          setStorageError("無法讀取先前的換算資料；為避免覆蓋原資料，目前輸入仍可試算，但這次不會自動儲存。");
        }
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!ready || !persistenceEnabled) return;
    let active = true;
    const revision = ++saveRevision.current;
    const write = saveQueue.current
      .catch(() => undefined)
      .then(() => storage.set(STORAGE_KEYS.calculator, draft));
    saveQueue.current = write;
    void write
      .then(() => {
        if (active && revision === saveRevision.current) setStorageError(null);
      })
      .catch(() => {
        if (active && revision === saveRevision.current) {
          setStorageError("換算內容目前無法儲存到這台裝置；請確認裝置仍有可用儲存空間。");
        }
      });
    return () => { active = false; };
  }, [draft, persistenceEnabled, ready]);

  const resource = useMemo(() => calculateResources(draft), [draft]);
  const recommendation = useMemo(() => recommendPacks(draft), [draft]);

  const updateNumber = useCallback((key: "cur" | "tickets" | "pulls" | "reserve", value: number) => {
    const number = Number(value);
    const bounded = Number.isFinite(number) ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, number)) : 0;
    const safeValue = key === "reserve" ? bounded : Math.floor(bounded);
    setDraft((current) => ({ ...current, [key]: safeValue }));
  }, []);

  const setPool = useCallback((pool: Pool) => setDraft((current) => ({ ...current, pool })), []);

  const setReserveUnit = useCallback((unit: ReserveUnit) => {
    setDraft((current) => {
      if (current.reserveUnit === unit) return current;
      const reserve =
        unit === "dia"
          ? Math.min(Number.MAX_SAFE_INTEGER, Math.round(current.reserve * DIA_PER_PULL))
          : Number((current.reserve / DIA_PER_PULL).toFixed(2));
      return { ...current, reserve, reserveUnit: unit };
    });
  }, []);

  const savePackPlanAsExpense = useCallback(async (
    pool: Pool,
    tier: string,
    planCost: number,
    context?: string,
  ): Promise<boolean> => {
    if (!Number.isFinite(planCost) || planCost <= 0 || !tier.trim()) return false;
    const pending: PendingExpense = {
      amt: planCost,
      cat: "抽卡禮包",
      note: `${context?.trim() ? `${context.trim()} · ` : ""}${pool} · 買到第 ${tier.trim()} 階`,
      date: todayKey(),
    };
    try {
      await storage.set(STORAGE_KEYS.pendingExpense, pending);
      setStorageError(null);
      return true;
    } catch {
      setStorageError("禮包建議無法帶入錢包，因為裝置目前無法儲存暫存資料。請確認儲存空間後再試一次。");
      return false;
    }
  }, []);

  const saveRecommendationAsExpense = useCallback(async (): Promise<boolean> => {
    if (recommendation.status !== "recommended" || !recommendation.planCost || !recommendation.tier) return false;
    return savePackPlanAsExpense(draft.pool, recommendation.tier.tier, recommendation.planCost);
  }, [draft.pool, recommendation, savePackPlanAsExpense]);

  return {
    ready,
    draft,
    resource,
    recommendation,
    targetHandoff,
    storageError,
    updateNumber,
    setPool,
    setReserveUnit,
    savePackPlanAsExpense,
    saveRecommendationAsExpense,
    clearTargetHandoff: () => setTargetHandoff(null),
  };
}

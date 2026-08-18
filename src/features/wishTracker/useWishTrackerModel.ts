import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { storage } from "@/data/repositories/storage";
import { STORAGE_KEYS } from "@/data/repositories/storage.types";
import { WISH_TRACKS, type FiveStarRecord, type FiveStarRecordDraft, type WishTrack, type WishTrackerState } from "@/domain/types";
import {
  adjustedPityCount,
  DEFAULT_WISH_TRACKER_STATE,
  featuredTargetPulls,
  nextFiveStarRecordId,
  normalizeFiveStarRecordDraft,
  normalizeWishTrackerState,
  resolvedFeaturedGuarantee,
  wishStatistics,
} from "@/domain/wishTracker";

export function useWishTrackerModel() {
  const [tracker, setTracker] = useState<WishTrackerState>(DEFAULT_WISH_TRACKER_STATE);
  const [recordFilter, setRecordFilter] = useState<WishTrack | "全部">("全部");
  const [ready, setReady] = useState(false);
  const [writeProtected, setWriteProtected] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const lastRecordId = useRef(0);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const stored = await storage.get<unknown>(STORAGE_KEYS.wishTracker, null);
        const normalized = normalizeWishTrackerState(stored);
        if (!active) return;
        lastRecordId.current = normalized.records.reduce((largest, record) => Math.max(largest, record.id), 0);
        setTracker(normalized);
        setWriteProtected(false);
        setStorageError(null);
        await storage.set(STORAGE_KEYS.wishTracker, normalized);
      } catch (error) {
        if (!active) return;
        setWriteProtected(true);
        setStorageError(
          error instanceof Error && error.message.startsWith("stored ")
            ? "裝置內的五星紀錄格式異常。為避免覆蓋，原資料已保留且本頁暫停寫入；Web 請先從關於頁下載原始救援檔，iOS 請勿移除 App。"
            : "無法讀寫這台裝置的五星紀錄。請確認仍有可用儲存空間後再試一次。",
        );
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => { active = false; };
  }, []);

  const persist = useCallback(async (next: WishTrackerState, errorMessage: string): Promise<boolean> => {
    if (writeProtected) return false;
    try {
      await storage.set(STORAGE_KEYS.wishTracker, next);
      setTracker(next);
      setStorageError(null);
      return true;
    } catch {
      setStorageError(errorMessage);
      return false;
    }
  }, [writeProtected]);

  const saveCurrentPity = useCallback(async (currentPity: Record<WishTrack, number>) => persist(
    { ...tracker, currentPity },
    "目前計數尚未儲存，原本的數字沒有改變。請確認裝置儲存空間後再試一次。",
  ), [persist, tracker]);

  const adjustCurrentPity = useCallback(async (track: WishTrack, delta: number): Promise<boolean> => persist(
    { ...tracker, currentPity: { ...tracker.currentPity, [track]: adjustedPityCount(tracker.currentPity[track], delta) } },
    "目前計數尚未更新，原本的數字沒有改變。請確認裝置儲存空間後再試一次。",
  ), [persist, tracker]);

  const setGuaranteeOverride = useCallback(async (
    track: WishTrack,
    value: true | false | null,
  ): Promise<boolean> => {
    if (track === "常駐池") return false;
    return persist(
      { ...tracker, guaranteeOverrides: { ...tracker.guaranteeOverrides, [track]: value } },
      "保證狀態尚未儲存，原本的設定沒有改變。請確認裝置儲存空間後再試一次。",
    );
  }, [persist, tracker]);

  const addRecord = useCallback(async (draft: FiveStarRecordDraft, resetCounter: boolean): Promise<boolean> => {
    const normalized = normalizeFiveStarRecordDraft(draft);
    if (!normalized || writeProtected) return false;
    const id = nextFiveStarRecordId(tracker.records, lastRecordId.current);
    lastRecordId.current = id;
    const next: WishTrackerState = {
      currentPity: resetCounter ? { ...tracker.currentPity, [normalized.track]: 0 } : tracker.currentPity,
      guaranteeOverrides: normalized.outcome === "未標記"
        ? tracker.guaranteeOverrides
        : { ...tracker.guaranteeOverrides, [normalized.track]: null },
      records: [{ id, ...normalized }, ...tracker.records],
    };
    return persist(next, "這筆五星紀錄尚未儲存，表單內容仍保留在畫面上。請確認裝置儲存空間後再試一次。");
  }, [persist, tracker, writeProtected]);

  const updateRecord = useCallback(async (record: FiveStarRecord): Promise<boolean> => {
    const normalized = normalizeFiveStarRecordDraft(record);
    if (!normalized || writeProtected || !tracker.records.some((item) => item.id === record.id)) return false;
    return persist(
      { ...tracker, records: tracker.records.map((item) => item.id === record.id ? { id: record.id, ...normalized } : item) },
      "修改尚未儲存，原本的五星紀錄沒有改變。",
    );
  }, [persist, tracker, writeProtected]);

  const deleteRecord = useCallback(async (id: number) => persist(
    { ...tracker, records: tracker.records.filter((record) => record.id !== id) },
    "刪除失敗，這筆五星紀錄仍然保留。",
  ), [persist, tracker]);

  const restoreRecord = useCallback(async (record: FiveStarRecord) => persist(
    { ...tracker, records: [record, ...tracker.records.filter((item) => item.id !== record.id)] },
    "復原失敗，這筆五星紀錄尚未重新加入。",
  ), [persist, tracker]);

  const statistics = useMemo(
    () => wishStatistics(tracker.records, recordFilter === "全部" ? null : recordFilter),
    [recordFilter, tracker.records],
  );
  const guarantees = useMemo(() => Object.fromEntries(
    WISH_TRACKS.map((track) => [track, resolvedFeaturedGuarantee(tracker.records, tracker.guaranteeOverrides, track)]),
  ) as Record<WishTrack, true | false | null>, [tracker.guaranteeOverrides, tracker.records]);
  const targets = useMemo(() => Object.fromEntries(
    WISH_TRACKS.map((track) => [track, featuredTargetPulls(tracker.currentPity[track], guarantees[track], track)]),
  ) as Record<WishTrack, ReturnType<typeof featuredTargetPulls>>, [guarantees, tracker.currentPity]);

  const prepareCalculatorTarget = useCallback(async (track: WishTrack): Promise<boolean> => {
    const target = targets[track];
    if (track === "常駐池" || target.featuredPulls === null || target.featuredPulls <= 0) return false;
    try {
      await storage.set(STORAGE_KEYS.pendingCalculatorTarget, {
        pulls: target.featuredPulls,
        pool: track === "復刻池" ? "復刻池" : null,
        source: `${track} · 目前累計 ${tracker.currentPity[track]} 抽${target.conservative ? " · 保守活動五星目標" : " · 已保證活動五星目標"}`,
      });
      setStorageError(null);
      return true;
    } catch {
      setStorageError("保底目標無法帶入換算。請確認裝置仍有可用儲存空間後再試一次。");
      return false;
    }
  }, [targets, tracker.currentPity]);

  return {
    ready,
    writeProtected,
    tracker,
    recordFilter,
    statistics,
    guarantees,
    targets,
    storageError,
    setRecordFilter,
    saveCurrentPity,
    adjustCurrentPity,
    setGuaranteeOverride,
    prepareCalculatorTarget,
    addRecord,
    updateRecord,
    deleteRecord,
    restoreRecord,
  };
}

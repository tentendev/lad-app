import { useEffect, useMemo, useRef, useState } from "react";

import { SCHEDULE } from "@/data/schedule";
import { storage } from "@/data/repositories/storage";
import { STORAGE_KEYS } from "@/data/repositories/storage.types";
import { LEADS, type Lead, type ScheduleEvent } from "@/domain/types";
import {
  DEFAULT_SCHEDULE_PREFERENCES,
  calendarBarSegments,
  calendarCells,
  eventsForDate,
  eventsForMonth,
  normalizeSchedulePreferences,
} from "@/domain/schedule";
import { scheduleEventToPullGoalDraft } from "@/domain/planner";

export function useScheduleModel(now = new Date()) {
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth();
  const [year, setYear] = useState(now.getFullYear());
  const [monthIndex, setMonthIndex] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<Lead[]>(DEFAULT_SCHEDULE_PREFERENCES.selectedLeads);
  const [preferencesReady, setPreferencesReady] = useState(false);
  const [preferencePersistenceEnabled, setPreferencePersistenceEnabled] = useState(false);
  const [preferenceError, setPreferenceError] = useState<string | null>(null);
  const [plannerError, setPlannerError] = useState<string | null>(null);
  const preferenceSaveQueue = useRef<Promise<void>>(Promise.resolve());
  const preferenceRevision = useRef(0);

  useEffect(() => {
    let active = true;
    void storage.get<unknown>(STORAGE_KEYS.schedulePreferences, null)
      .then(async (stored) => stored ?? { selectedLeads: await storage.get<unknown>("leadFilter", [...LEADS]) })
      .then((stored) => {
        if (!active) return;
        setSelectedLeads(normalizeSchedulePreferences(stored).selectedLeads);
        setPreferencePersistenceEnabled(true);
        setPreferenceError(null);
      })
      .catch(() => {
        if (!active) return;
        setPreferencePersistenceEnabled(false);
        setPreferenceError("無法讀取先前的男主篩選；這次仍可篩選，但不會覆蓋原設定。");
      })
      .finally(() => {
        if (active) setPreferencesReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!preferencesReady || !preferencePersistenceEnabled) return;
    let active = true;
    const revision = ++preferenceRevision.current;
    const write = preferenceSaveQueue.current
      .catch(() => undefined)
      .then(() => storage.set(STORAGE_KEYS.schedulePreferences, { selectedLeads }));
    preferenceSaveQueue.current = write;
    void write
      .then(() => {
        if (active && revision === preferenceRevision.current) setPreferenceError(null);
      })
      .catch(() => {
        if (active && revision === preferenceRevision.current) {
          setPreferenceError("男主篩選目前無法儲存在這台裝置；這次仍可使用。");
        }
      });
    return () => {
      active = false;
    };
  }, [preferencePersistenceEnabled, preferencesReady, selectedLeads]);

  const filteredEvents = useMemo(
    () => SCHEDULE.filter((event) => !event.leads?.length || event.leads.some((lead) => selectedLeads.includes(lead))),
    [selectedLeads],
  );
  const calendar = useMemo(() => calendarCells(filteredEvents, year, monthIndex), [filteredEvents, year, monthIndex]);
  const calendarBars = useMemo(
    () => calendarBarSegments(filteredEvents, year, monthIndex),
    [filteredEvents, year, monthIndex],
  );
  const monthEvents = useMemo(() => eventsForMonth(filteredEvents, year, monthIndex), [filteredEvents, year, monthIndex]);
  const selectedEvents = useMemo(
    () => (selectedDate ? eventsForDate(filteredEvents, selectedDate) : monthEvents),
    [filteredEvents, monthEvents, selectedDate],
  );

  function move(delta: number) {
    const target = new Date(year, monthIndex + delta, 1);
    setYear(target.getFullYear());
    setMonthIndex(target.getMonth());
    setSelectedDate(null);
  }

  function selectDate(date: string) {
    setSelectedDate((current) => (current === date ? null : date));
  }

  function goToCurrentMonth() {
    setYear(currentYear);
    setMonthIndex(currentMonthIndex);
    setSelectedDate(null);
  }

  function toggleLead(lead: Lead) {
    setSelectedLeads((current) =>
      current.includes(lead) ? current.filter((item) => item !== lead) : [...current, lead],
    );
    setSelectedDate(null);
  }

  async function preparePullGoal(event: ScheduleEvent): Promise<boolean> {
    const draft = scheduleEventToPullGoalDraft(event);
    if (!draft) return false;
    try {
      await storage.set(STORAGE_KEYS.pendingPullGoal, draft);
      setPlannerError(null);
      return true;
    } catch {
      setPlannerError("這項排期目前無法帶入規劃。請確認裝置仍有可用儲存空間後再試一次。");
      return false;
    }
  }

  return {
    year,
    monthIndex,
    selectedDate,
    selectedLeads,
    calendar,
    calendarBars,
    monthEvents,
    selectedEvents,
    isCurrentMonth: year === currentYear && monthIndex === currentMonthIndex,
    preferenceError,
    plannerError,
    previousMonth: () => move(-1),
    nextMonth: () => move(1),
    goToCurrentMonth,
    selectDate,
    toggleLead,
    showAllLeads: () => {
      setSelectedLeads([...LEADS]);
      setSelectedDate(null);
    },
    clearLeads: () => { setSelectedLeads([]); setSelectedDate(null); },
    clearSelection: () => setSelectedDate(null),
    preparePullGoal,
  };
}

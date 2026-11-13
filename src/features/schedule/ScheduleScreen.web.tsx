import { useGSAP } from "@gsap/react";
import { Card } from "@heroui/react/card";
import { gsap } from "gsap";
import { useRef, useState } from "react";
import { useRouter } from "expo-router";

import { EVENT_COLORS } from "@/theme/tokens";
import { SCHEDULE_META } from "@/data/schedule";
import { pad, todayKey } from "@/domain/format";
import { EVENT_LABELS, eventsForDate, isScheduleForecast, eventStatus, scheduleEventCalendarFilename, scheduleEventToIcs, scheduleEventsToIcs } from "@/domain/schedule";
import { canPlanScheduleEvent } from "@/domain/planner";
import { LEADS, type Lead, type ScheduleEvent, type ScheduleEventType } from "@/domain/types";
import { WebPage } from "@/ui/WebPage.web";
import { useScheduleModel } from "./useScheduleModel";

gsap.registerPlugin(useGSAP);

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
const LEGEND: ScheduleEventType[] = ["merch", "daily", "monthly", "mixed", "birthday", "rerun", "pass", "story"];
const LEAD_CLASS: Record<Lead, string> = {
  沈星回: "xavier",
  黎深: "zayne",
  祁煜: "rafayel",
  秦徹: "sylus",
  夏以晝: "caleb",
};

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d={direction === "left" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
    </svg>
  );
}

function leadLabel(event: ScheduleEvent): { label: string; className: string } | null {
  if (!event.leads?.length) return null;
  if (event.leads.length === LEADS.length) return { label: "全員", className: "multi" };
  if (event.leads.length > 1) return { label: "多人", className: "multi" };
  return { label: event.leads[0], className: LEAD_CLASS[event.leads[0]] };
}

function EventRow({ event, onPlan, onCalendar }: { event: ScheduleEvent; onPlan: (event: ScheduleEvent) => void; onCalendar: (event: ScheduleEvent) => void }) {
  const status = eventStatus(event, todayKey());
  const lead = leadLabel(event);
  return <details className="pearl-event motion-row motion-data" role="listitem"><summary><i className="event-color-rail" style={{ backgroundColor: EVENT_COLORS[event.type] }}/><div className="row-main"><strong>{event.name}</strong><span><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 2v6M16 2v6M3 11h18"/></svg>{event.start.slice(5).replace("-", " / ")}{event.end ? event.end !== event.start ? ` – ${event.end.slice(0,4) !== event.start.slice(0,4) ? event.end.slice(0,4) + " / " : ""}${event.end.slice(5).replace("-", " / ")}` : "" : " · 結束日待確認"}</span></div><span className={`event-badge ${isScheduleForecast(event, todayKey()) ? "forecast" : status.tone}`}>{isScheduleForecast(event, todayKey()) ? "預測" : status.label}</span><span aria-hidden="true" className="pearl-event-chevron">›</span></summary><div className="pearl-event-actions"><span>{EVENT_LABELS[event.type]}{lead ? ` · ${lead.label}` : ""} · {event.start}{event.end ? ` ～ ${event.end}` : ""}</span>{event.source ? <a className="text-button" href={event.source} target="_blank" rel="noopener noreferrer">官方公告 ↗</a> : null}<button className="text-button" type="button" onClick={() => onCalendar(event)}>加入行事曆</button>{canPlanScheduleEvent(event, todayKey()) ? <button className="text-button" type="button" onClick={() => onPlan(event)}>加入規劃</button> : null}</div></details>;
}

export function ScheduleScreenWeb() {
  const motionRootRef = useRef<HTMLDivElement>(null);
  const initialDataMotion = useRef(true);
  const model = useScheduleModel();
  const router = useRouter();
  const [showBars, setShowBars] = useState(false);
  const today = todayKey();
  const laneCount = Math.max(1, ...model.calendarBars.map(segment => segment.lane + 1));
  const rowsPerWeek = laneCount + 1;
  const weeks = Math.ceil((model.calendar.leading + model.calendar.cells.length) / 7);
  const allLeadsSelected = model.selectedLeads.length === LEADS.length;
  const selectionTitle = model.selectedDate
    ? `${Number(model.selectedDate.slice(5, 7))}月${Number(model.selectedDate.slice(8, 10))}日 排期`
    : `${pad(model.monthIndex + 1)}月 排期`;
  const dataMotionKey = [
    model.year,
    model.monthIndex,
    model.selectedDate ?? "month",
    model.selectedLeads.join("|"),
  ].join(":");

  async function planEvent(event: ScheduleEvent) {
    if (await model.preparePullGoal(event)) router.push("/calculator");
  }

  function downloadCalendarEvent(event: ScheduleEvent) {
    downloadCalendar(scheduleEventToIcs(event), scheduleEventCalendarFilename(event));
  }

  function downloadCalendar(content: string, filename: string) {
    const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  }

  function downloadVisibleCalendar() {
    const scope = model.selectedDate ?? `${model.year}-${pad(model.monthIndex + 1)}`;
    downloadCalendar(scheduleEventsToIcs(model.selectedEvents), `deep-space-ledger-schedule-${scope}.ics`);
  }

  useGSAP(() => {
    const scope = motionRootRef.current;
    if (!scope) return;
    const media = gsap.matchMedia();
    media.add(
      {
        reduceMotion: "(prefers-reduced-motion: reduce)",
        isDesktop: "(any-hover: hover) and (any-pointer: fine)",
      },
      (context) => {
        if (context.conditions?.reduceMotion) return;
        const lift = context.conditions?.isDesktop ? 14 : 8;
        const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
        timeline
          .fromTo(
            ".motion-surface",
            { autoAlpha: 0, y: lift, scale: 0.992 },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 0.58,
              stagger: 0.1,
              clearProps: "transform,opacity,visibility",
            },
            0,
          )
          .fromTo(
            ".motion-detail",
            { autoAlpha: 0, y: 7 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.38,
              stagger: 0.045,
              clearProps: "transform,opacity,visibility",
            },
            0.1,
          )
          .fromTo(
            ".motion-event",
            { scaleX: 0.72, transformOrigin: "left center" },
            {
              scaleX: 1,
              duration: 0.36,
              stagger: 0.018,
              clearProps: "transform,transform-origin",
            },
            0.24,
          )
          .fromTo(
            ".motion-row",
            { autoAlpha: 0, y: 6 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.34,
              stagger: 0.035,
              clearProps: "transform,opacity,visibility",
            },
            0.3,
          );
      },
      scope,
    );
    return () => media.revert();
  }, { scope: motionRootRef });

  useGSAP(() => {
    const scope = motionRootRef.current;
    if (!scope) return;
    if (initialDataMotion.current) {
      initialDataMotion.current = false;
      return;
    }
    const media = gsap.matchMedia();
    media.add(
      "(prefers-reduced-motion: no-preference)",
      () => {
        gsap.fromTo(
          ".motion-data",
          { y: 7 },
          {
            y: 0,
            duration: 0.34,
            ease: "power2.out",
            stagger: 0.025,
            clearProps: "transform",
          },
        );
      },
      scope,
    );
    return () => media.revert();
  }, {
    dependencies: [dataMotionKey],
    scope: motionRootRef,
    revertOnUpdate: true,
  });

  return (
    <WebPage
      eyebrow="Schedule"
      title="排期"
      description="把官方公告與預測排期放在同一個月曆裡。"
    >
      <div className="page-grid schedule-page" ref={motionRootRef}>
        {model.preferenceError ? <div className="status-note over" role="alert">{model.preferenceError}</div> : null}
        {model.plannerError ? <div className="status-note over" role="alert">{model.plannerError}</div> : null}
        <Card className="product-card calendar-card">


          <div className="month-switcher calendar-heading">
            <button className="nav-button" type="button" aria-label="上個月" onClick={model.previousMonth}>
              <Chevron direction="left" />
            </button>
            <h2>{model.year}<span className="date-unit">年</span> {pad(model.monthIndex + 1)}<span className="date-unit">月</span></h2>
            <button className="nav-button" type="button" aria-label="下個月" onClick={model.nextMonth}>
              <Chevron direction="right" />
            </button>
          </div>
          {!model.isCurrentMonth ? <button className="text-button calendar-return motion-detail" type="button" onClick={model.goToCurrentMonth}>回到本月</button> : null}

          <div className="lead-filter motion-detail" role="group" aria-label="男主篩選">
            <div className="lead-filter-actions" id="schedule-lead-filters">
              <button
                type="button"
                className={`lead-filter-button all ${allLeadsSelected ? "active" : ""}`}
                aria-pressed={allLeadsSelected}
                onClick={model.showAllLeads}
              >
                全部
              </button>
              {LEADS.map((lead) => {
                const active = model.selectedLeads.includes(lead);
                return (
                  <button
                    type="button"
                    key={lead}
                    className={`lead-filter-button ${active && !allLeadsSelected ? "active" : ""}`}
                    aria-pressed={active}
                    onClick={() => model.toggleLead(lead)}
                  >
                    {lead}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="calendar-weekdays motion-detail" aria-hidden="true">
            {WEEKDAYS.map((day) => <span key={day}>{day}</span>)}
          </div>
          <div
            className={`calendar-grid motion-detail motion-data ${showBars ? "" : "pearl-calendar"}`}
            role="group"
            aria-label={`${model.year}年${model.monthIndex + 1}月月曆`}
            style={{ gridTemplateRows: showBars ? `repeat(${weeks}, 26px ${Array(laneCount).fill("14px").join(" ")})` : `repeat(${weeks}, 48px)` }}
          >
            {model.calendar.cells.map((cell) => {
              const index = model.calendar.leading + cell.day - 1;
              const week = Math.floor(index / 7);
              const column = index % 7 + 1;
              return (
                <button
                  type="button"
                  key={cell.key}
                  className={`calendar-day ${cell.weekday === 0 ? "sunday" : ""} ${cell.eventCount ? "has" : ""} ${cell.key === today ? "today" : ""} ${cell.key === model.selectedDate ? "selected" : ""}`}
                  style={{ gridColumn: column, gridRow: showBars ? `${week * rowsPerWeek + 1} / span ${rowsPerWeek}` : week + 1 }}
                  aria-label={`${cell.key}，${cell.eventCount} 個排期`}
                  aria-pressed={cell.key === model.selectedDate}
                  onClick={() => model.selectDate(cell.key)}
                >
                  <span>{cell.day}</span>{!showBars ? <i className="calendar-dots" aria-hidden="true">{[...new Set(eventsForDate(model.monthEvents, cell.key).map(event => event.type))].slice(0, 3).map(type => <b key={type} style={{ backgroundColor: EVENT_COLORS[type] }}/>)}</i> : null}
                </button>
              );
            })}
            {showBars ? model.calendarBars.map((segment) => (
              <span
                aria-hidden="true"
                className={`calendar-event motion-event motion-data t-${segment.event.type} ${isScheduleForecast(segment.event, todayKey()) ? "tentative" : ""}`}
                key={segment.key}
                style={{
                  gridColumn: `${segment.startColumn} / ${segment.endColumn + 1}`,
                  gridRow: segment.week * rowsPerWeek + 2 + segment.lane,
                }}
                title={segment.event.name}
              >
                {segment.event.name}
              </span>
            )) : null}
          </div>

        </Card>

        <section className="schedule-list-card motion-surface">
          <h2 className="visually-hidden">{selectionTitle}</h2>{model.selectedDate ? <button className="text-button" type="button" onClick={model.clearSelection}>看整月</button> : null}
          <div className="schedule-list motion-detail motion-data" role={model.selectedEvents.length ? "list" : undefined}>
            {model.selectedEvents.length === 0 ? (
              <div className="empty-state">{model.selectedDate ? "這天沒有排期" : "目前篩選沒有排期"}{!allLeadsSelected ? <button className="text-button" type="button" onClick={model.showAllLeads}>顯示全部男主</button> : null}</div>
            ) : null}
            {model.selectedEvents.map((event, index) => (
              <EventRow
                key={`${event.name}-${event.start}-${index}`}
                event={event}
                onCalendar={downloadCalendarEvent}
                onPlan={(item) => void planEvent(item)}
              />
            ))}
          </div>
        </section>
        <details className="schedule-notes pearl-details"><summary>月曆顯示與排期來源</summary><div className="schedule-note-actions"><button className="text-button" type="button" disabled={!model.selectedEvents.length} onClick={downloadVisibleCalendar}>匯出顯示排期</button><button type="button" className="text-button" aria-pressed={showBars} onClick={() => setShowBars(!showBars)}>{showBars ? "切換圓點月曆" : "切換色條月曆"}</button><button type="button" className="text-button" onClick={model.clearLeads}>清除全部男主</button></div>          <div className="calendar-meta motion-detail">
            <span className="data-lock">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              {SCHEDULE_META.label}
            </span>
            <span>排期更新 {SCHEDULE_META.updated}</span>
          </div>          <div className="calendar-legend motion-detail" role="group" aria-label="排期類型圖例">
            {LEGEND.map((type) => (
              <span key={type}><i className={`legend-dot t-${type}`} />{EVENT_LABELS[type]}</span>
            ))}
          </div>
          <p className="schedule-disclaimer motion-detail">
            ※預測排期為非官方資訊，實際卡池與日期請以《戀與深空》官方公告為準。
          </p>
</details>
      </div>
    </WebPage>
  );
}

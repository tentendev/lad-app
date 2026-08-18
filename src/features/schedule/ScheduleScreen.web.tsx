import { useGSAP } from "@gsap/react";
import { Card } from "@heroui/react/card";
import { gsap } from "gsap";
import { useRef } from "react";
import { useRouter } from "expo-router";

import { SCHEDULE_META } from "@/data/schedule";
import { pad, todayKey } from "@/domain/format";
import { EVENT_LABELS, eventStatus, scheduleEventCalendarFilename, scheduleEventToIcs, scheduleEventsToIcs } from "@/domain/schedule";
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

function EventIcon({ type }: { type: ScheduleEventType }) {
  if (type === "pass") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="16" rx="3" />
        <path d="M8 2v4M16 2v4M3 9h18" />
      </svg>
    );
  }
  if (type === "merch") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6a3 3 0 0 0 3 3 3 3 0 0 0 0 6 3 3 0 0 0-3 3h18a3 3 0 0 0-3-3 3 3 0 0 0 0-6 3 3 0 0 0 3-3Z" />
      <path d="M13 6v12" />
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
  return (
    <div className="schedule-row event-item motion-row motion-data" role="listitem">
      <span className={`event-icon t-${event.type}`}><EventIcon type={event.type} /></span>
      <div className="row-main">
        <div className="row-title">
          {event.name}
          {lead ? <span className={`lead-tag lead-${lead.className}`}>{lead.label}</span> : null}
        </div>
        <div className="row-subtitle">
          {EVENT_LABELS[event.type]} · {event.start}{event.end !== event.start ? ` ~ ${event.end}` : ""}
        </div>
      </div>
      <div className="schedule-row-actions">
        <span className={`event-badge ${status.tone}`}>{status.label}</span>
        <div className="schedule-row-links">
          <button className="text-button" type="button" onClick={() => onCalendar(event)}>加入行事曆</button>
          {canPlanScheduleEvent(event, todayKey()) ? <button className="text-button" type="button" onClick={() => onPlan(event)}>加入規劃</button> : null}
        </div>
      </div>
    </div>
  );
}

export function ScheduleScreenWeb() {
  const motionRootRef = useRef<HTMLDivElement>(null);
  const initialDataMotion = useRef(true);
  const model = useScheduleModel();
  const router = useRouter();
  const today = todayKey();
  const weeks = Math.ceil((model.calendar.leading + model.calendar.cells.length) / 7);
  const allLeadsSelected = model.selectedLeads.length === LEADS.length;
  const selectionTitle = model.selectedDate
    ? `${Number(model.selectedDate.slice(5, 7))}月${Number(model.selectedDate.slice(8, 10))}日 排期`
    : `${pad(model.monthIndex + 1)}月 排期`;
  const officialCount = model.monthEvents.filter((event) => !event.tentative).length;
  const predictedCount = model.monthEvents.length - officialCount;
  const officialNames = model.monthEvents.filter((event) => !event.tentative).map((event) => event.name);
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
          <div className="calendar-meta motion-detail">
            <span className="data-lock">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              {SCHEDULE_META.label}
            </span>
            <span>排期更新 {SCHEDULE_META.updated}</span>
          </div>

          <div className="month-switcher calendar-heading">
            <button className="nav-button" type="button" aria-label="上個月" onClick={model.previousMonth}>
              <Chevron direction="left" />
            </button>
            <h2>{model.year}年 {pad(model.monthIndex + 1)}月</h2>
            <button className="nav-button" type="button" aria-label="下個月" onClick={model.nextMonth}>
              <Chevron direction="right" />
            </button>
          </div>
          {!model.isCurrentMonth ? <button className="text-button calendar-return motion-detail" type="button" onClick={model.goToCurrentMonth}>回到本月</button> : null}

          <div className="lead-filter motion-detail" role="group" aria-label="男主篩選">
            <div className="lead-filter-head">
              <strong>男主篩選</strong>
              <span>{allLeadsSelected ? "已顯示全部" : `已選 ${model.selectedLeads.length} 位`}</span>
            </div>
            <div className="lead-filter-actions">
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
                    className={`lead-filter-button lead-${LEAD_CLASS[lead]} ${active ? "active" : ""}`}
                    aria-pressed={active}
                    onClick={() => model.toggleLead(lead)}
                  >
                    <i className="lead-dot" aria-hidden="true" />
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
            className="calendar-grid motion-detail motion-data"
            role="group"
            aria-label={`${model.year}年${model.monthIndex + 1}月月曆`}
            style={{ gridTemplateRows: `repeat(${weeks}, 26px 14px 14px 14px)` }}
          >
            {model.calendar.cells.map((cell) => {
              const index = model.calendar.leading + cell.day - 1;
              const week = Math.floor(index / 7);
              const column = index % 7 + 1;
              return (
                <button
                  type="button"
                  key={cell.key}
                  className={`calendar-day ${cell.eventCount ? "has" : ""} ${cell.key === today ? "today" : ""} ${cell.key === model.selectedDate ? "selected" : ""}`}
                  style={{ gridColumn: column, gridRow: `${week * 4 + 1} / span 4` }}
                  aria-label={`${cell.key}，${cell.eventCount} 個排期`}
                  aria-pressed={cell.key === model.selectedDate}
                  onClick={() => model.selectDate(cell.key)}
                >
                  <span>{cell.day}</span>
                </button>
              );
            })}
            {model.calendarBars.map((segment) => (
              <span
                aria-hidden="true"
                className={`calendar-event motion-event motion-data t-${segment.event.type} ${segment.event.tentative ? "tentative" : ""}`}
                key={segment.key}
                style={{
                  gridColumn: `${segment.startColumn} / ${segment.endColumn + 1}`,
                  gridRow: segment.week * 4 + 2 + segment.lane,
                }}
                title={segment.event.name}
              >
                {segment.event.name}
              </span>
            ))}
          </div>

          <div className="calendar-legend motion-detail" role="group" aria-label="排期類型圖例">
            {LEGEND.map((type) => (
              <span key={type}><i className={`legend-dot t-${type}`} />{EVENT_LABELS[type]}</span>
            ))}
          </div>
          <p className="schedule-disclaimer motion-detail">
            ※ {officialNames.length ? `「${officialNames.join("」與「")}」已有官方公告；` : "本月尚無已確認項目；"}
            其餘 {predictedCount} 筆內容為排期預測，非官方資訊，實際卡池與日期請以《戀與深空》官方公告為準。
          </p>
        </Card>

        <Card className="product-card schedule-list-card motion-surface">
          <div className="section-heading motion-detail">
            <h2 className="section-title">{selectionTitle}</h2>
            <div className="section-inline-actions">
              <button className="text-button" type="button" disabled={!model.selectedEvents.length} onClick={downloadVisibleCalendar}>匯出顯示排期</button>
              {model.selectedDate ? <button className="text-button" type="button" onClick={model.clearSelection}>看整月</button> : null}
            </div>
          </div>
          <div className="schedule-list motion-detail motion-data" role={model.selectedEvents.length ? "list" : undefined}>
            {model.selectedEvents.length === 0 ? (
              <div className="empty-state">{model.selectedDate ? "這天沒有排期" : "目前篩選沒有排期"}</div>
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
        </Card>
      </div>
    </WebPage>
  );
}

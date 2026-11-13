import { useState } from "react";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Linking, Pressable, ScrollView, Share, StyleSheet, useWindowDimensions, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, Typography } from "@/ui/NativeComponents";
import Svg, { Path, Rect } from "react-native-svg";

import { SCHEDULE_META } from "@/data/schedule";
import { pad, todayKey } from "@/domain/format";
import { EVENT_LABELS, isScheduleForecast, eventStatus, scheduleEventCalendarFilename, scheduleEventToIcs, scheduleEventsToIcs } from "@/domain/schedule";
import { canPlanScheduleEvent } from "@/domain/planner";
import { LEADS, type ScheduleEvent, type ScheduleEventType } from "@/domain/types";
import { EVENT_COLORS, LEAD_COLORS } from "@/theme/tokens";
import { PearlCalendar } from "@/ui/PearlCalendar";
import { PearlSurface } from "@/ui/PearlSurface";
import { NativeDisclosure } from "@/ui/NativeDisclosure";
import { NATIVE_FONTS } from "@/theme/native";
import { NativePage } from "@/ui/NativePage";
import { nativeCalendarWidth } from "@/ui/nativeLayout";
import { NativeColumns } from "@/ui/NativeColumns";
import { useScheduleModel } from "./useScheduleModel";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];


const styles = StyleSheet.create({
  dayCell: {
    width: "14.2857%",
    paddingVertical: 2,
  },
  eventBar: {
    position: "absolute",

    borderRadius: 4,
    paddingHorizontal: 4,
    justifyContent: "center",
    overflow: "hidden",
    zIndex: 4,
  },
});

function NativeEventIcon({ type }: { type: ScheduleEventType }) {
  if (type === "pass") {
    return (
      <Svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke="#80639f" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
        <Rect x={3} y={4} width={18} height={16} rx={3} />
        <Path d="M8 2v4M16 2v4M3 9h18" />
      </Svg>
    );
  }
  if (type === "merch") {
    return (
      <Svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke="#80639f" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
      </Svg>
    );
  }
  return (
    <Svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke="#80639f" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 6a3 3 0 0 0 3 3 3 3 0 0 0 0 6 3 3 0 0 0-3 3h18a3 3 0 0 0-3-3 3 3 0 0 0 0-6 3 3 0 0 0 3-3Z" />
      <Path d="M13 6v12" />
    </Svg>
  );
}

function nativeLeadLabel(event: ScheduleEvent): { label: string; color: string } | null {
  if (!event.leads?.length) return null;
  if (event.leads.length === LEADS.length) return { label: "全員", color: "#ddd5e9" };
  if (event.leads.length > 1) return { label: "多人", color: "#ddd5e9" };
  return { label: event.leads[0], color: LEAD_COLORS[event.leads[0]] };
}

export function ScheduleScreenNative() {
  const model = useScheduleModel();
  const [showBars, setShowBars] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const { width, fontScale } = useWindowDimensions();
  const [viewMode, setViewMode] = useState<"calendar" | "list" | null>(null);
  const showCalendar = (viewMode ?? (fontScale > 1.3 || width < 360 ? "list" : "calendar")) === "calendar";
  const [calendarContainerWidth, setCalendarContainerWidth] = useState(0);
  const calendarWidth = nativeCalendarWidth(calendarContainerWidth);
  const barHeight = Math.ceil(20 * fontScale + 8);
  const dayHeaderHeight = Math.ceil(24 * fontScale + 16);

  const [linkError, setLinkError] = useState<string | null>(null);
  const router = useRouter();
  const today = todayKey();
  const weeks = Math.ceil((model.calendar.leading + model.calendar.cells.length) / 7);
  const totalSlots = weeks * 7;
  const weekHeights = Array.from({ length: weeks }, (_, week) => {
    const lanes = Math.max(1, ...model.calendarBars.filter(segment => segment.week === week).map(segment => segment.lane + 1));
    return dayHeaderHeight + lanes * (barHeight + 4) + 8;
  });
  const weekOffsets = weekHeights.map((_, week) => weekHeights.slice(0, week).reduce((sum, height) => sum + height, 0));
  const allLeadsSelected = model.selectedLeads.length === LEADS.length;

  async function planEvent(event: ScheduleEvent) {
    if (await model.preparePullGoal(event)) router.push("/calculator");
  }

  async function shareCalendarEvent(event: ScheduleEvent) {
    await shareCalendar(scheduleEventToIcs(event), scheduleEventCalendarFilename(event), event.name);
  }

  async function shareCalendar(ics: string, filename: string, title: string) {
    if (await Sharing.isAvailableAsync()) {
      const uri = `${FileSystem.cacheDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(uri, ics, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(uri, { mimeType: "text/calendar", UTI: "public.calendar-event" });
      return;
    }
    await Share.share({ message: ics, title });
  }

  async function shareVisibleCalendar() {
    const scope = model.selectedDate ?? `${model.year}-${pad(model.monthIndex + 1)}`;
    await shareCalendar(
      scheduleEventsToIcs(model.selectedEvents),
      `deep-space-ledger-schedule-${scope}.ics`,
      `${scope} 排期`,
    );
  }

  return (
    <NativePage workspace eyebrow={`${SCHEDULE_META.label} · 更新 ${SCHEDULE_META.updated}`} title="排期" description="官方公告與預測排期集中查看；虛線色條為排期預測。">
      {model.preferenceError ? <View accessibilityRole="alert" className="rounded-xl border border-[#ffafbd] bg-[#ff6675]/20 p-3"><Typography className="type-body text-ink">{model.preferenceError}</Typography></View> : null}
      {model.plannerError ? <View accessibilityRole="alert" className="rounded-xl border border-[#ffafbd] bg-[#ff6675]/20 p-3"><Typography className="type-body text-ink">{model.plannerError}</Typography></View> : null}
      {linkError ? <Typography accessibilityRole="alert" className="type-body text-danger">{linkError}</Typography> : null}

      <View className="gap-3" style={{ paddingHorizontal: 4 }}>
        <View className="flex-row items-center justify-between gap-2">
          <Button accessibilityLabel="上個月" size="sm" variant="secondary" className="border border-line" onPress={model.previousMonth}>‹</Button>
          <Typography.Heading type="h4" className="flex-1 text-center text-ink" style={{ fontSize: 26 }}>{model.year}年 {pad(model.monthIndex + 1)}月</Typography.Heading>
          <Button accessibilityLabel="下個月" size="sm" variant="secondary" className="border border-line" onPress={model.nextMonth}>›</Button>
        </View>
        {!model.isCurrentMonth ? <Button size="sm" variant="ghost" className="self-center border border-line" onPress={model.goToCurrentMonth}>回到本月</Button> : null}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: "center", gap: 4 }}>
          <Pressable accessibilityRole="button" accessibilityState={{ selected: allLeadsSelected }} onPress={model.showAllLeads} style={{ minHeight: 44, justifyContent: "center" }}><View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: "#e1d7ec" }}>{allLeadsSelected ? <PearlSurface tone="primary"/> : <PearlSurface/>}<Typography style={{ fontSize: 14, color: allLeadsSelected ? "#fff" : "#30213f" }}>全部</Typography></View></Pressable>
          {LEADS.map(lead => { const active = model.selectedLeads.includes(lead) && !allLeadsSelected; return <Pressable key={lead} accessibilityRole="button" accessibilityState={{ selected: model.selectedLeads.includes(lead) }} onPress={() => model.toggleLead(lead)} style={{ minHeight: 44, justifyContent: "center" }}><View style={{ paddingHorizontal: 9, paddingVertical: 6, borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: "#e1d7ec" }}><PearlSurface tone={active ? "lavender" : "glass"}/><Typography style={{ fontSize: 14 }}>{lead}</Typography></View></Pressable>; })}
        </ScrollView>
        {showCalendar && !showBars ? <PearlCalendar calendar={model.calendar} events={model.monthEvents} selected={model.selectedDate} today={today} onSelect={model.selectDate}/> : null}
        {showCalendar && showBars ? <>
        <Typography className="type-label text-muted">點日期查看完整活動；色條虛線代表預測。{calendarContainerWidth > 0 && calendarWidth > calendarContainerWidth ? "月曆可左右滑動。" : ""}</Typography>
        <View onLayout={event => setCalendarContainerWidth(event.nativeEvent.layout.width)}>
        <ScrollView horizontal showsHorizontalScrollIndicator><View style={{ width: calendarWidth }}>
        <View className="flex-row">
          {WEEKDAYS.map((day) => (
            <View key={day} style={{ width: "14.2857%" }} className="items-center py-2">
              <Typography className="type-label text-muted">{day}</Typography>
            </View>
          ))}
        </View>

        <View className="relative flex-row flex-wrap" style={{ height: weekHeights.reduce((sum, height) => sum + height, 0) }}>
          {Array.from({ length: totalSlots }, (_, index) => {
            const day = index - model.calendar.leading + 1;
            const cell = day > 0 ? model.calendar.cells[day - 1] : undefined;
            if (!cell) return <View key={`blank-${index}`} style={[styles.dayCell, { height: weekHeights[Math.floor(index / 7)] }]} />;
            const selected = cell.key === model.selectedDate;
            const isToday = cell.key === today;
            return (
              <View key={cell.key} style={[styles.dayCell, { height: weekHeights[Math.floor(index / 7)] }]}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${cell.key}，${cell.eventCount} 個排期`}
                  accessibilityState={{ selected }}
                  onPress={() => { model.selectDate(cell.key); setViewMode("list"); }}
                  className={`h-full items-center rounded-xl border pt-2 ${selected ? "border-line bg-orbit/10" : "border-line bg-white/70"}`}
                >
                  <Typography className={`type-body font-semibold ${isToday ? "text-ink" : "text-muted"}`}>{cell.day}</Typography>
                  {isToday ? <View className="mt-1 h-0.5 w-4 rounded-full bg-orbit" /> : null}
                </Pressable>
              </View>
            );
          })}
          <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" className="absolute inset-0">
            {model.calendarBars.map((segment) => {
              const color = EVENT_COLORS[segment.event.type];
              const left = `${((segment.startColumn - 1) / 7) * 100}%` as `${number}%`;
              const width = `${((segment.endColumn - segment.startColumn + 1) / 7) * 100}%` as `${number}%`;
              return (
                <View
                  key={segment.key}
                  style={[
                    styles.eventBar,
                    {
                      top: weekOffsets[segment.week] + dayHeaderHeight + segment.lane * (barHeight + 4),
                      height: barHeight,
                      left,
                      width,
                      backgroundColor: color,
                      borderColor: "#80639f",
                      borderWidth: isScheduleForecast(segment.event, todayKey()) ? 1 : 0,
                      borderStyle: isScheduleForecast(segment.event, todayKey()) ? "dashed" : "solid",
                    },
                  ]}
                >
                  <Typography numberOfLines={1} className="type-label font-semibold text-ink">{segment.event.name}</Typography>
                </View>
              );
            })}
          </View>
        </View>

        </View></ScrollView></View>
        </> : null}

      </View>

      <View className="gap-3">{model.selectedDate ? <Button variant="ghost" onPress={model.clearSelection}>查看整月</Button> : null}
        {model.selectedEvents.length === 0 ? <Typography className="type-body text-muted">目前篩選沒有排期</Typography> : null}
        <NativeColumns minimum={360}>{model.selectedEvents.map((event, index) => {
          const key = `${event.name}-${event.start}-${index}`;
          const open = expandedEvent === key;
          const status = eventStatus(event, today);
          const lead = nativeLeadLabel(event);
          const forecast = isScheduleForecast(event, today);
          return <Card key={key} style={{ padding: 0 }}><Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setExpandedEvent(open ? null : key)} style={{ flexDirection: "row", alignItems: "center", padding: 14, gap: 12 }}><View style={{ width: 7, alignSelf: "stretch", minHeight: 50, borderRadius: 6, opacity: .65, backgroundColor: EVENT_COLORS[event.type] }}/><View style={{ flex: 1, gap: 6 }}><Typography.Heading style={{ fontSize: 18, lineHeight: 26 }}>{event.name}</Typography.Heading><View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><NativeEventIcon type="pass"/><Typography style={{ fontFamily: NATIVE_FONTS.number, fontSize: 16 }}>{event.start.slice(5).replace("-", " / ")}{event.end ? event.end !== event.start ? ` – ${event.end.slice(5).replace("-", " / ")}` : "" : " · 結束日待確認"}</Typography></View></View><View style={{ borderRadius: 12, paddingHorizontal: 9, paddingVertical: 4, backgroundColor: forecast ? "#e5edf8" : status.tone === "live" ? "#e8f2ec" : "#f2eaf7" }}><Typography style={{ fontSize: 13, color: forecast ? "#45678e" : "#665175" }}>{forecast ? "預測" : status.label}</Typography></View><Typography style={{ fontSize: 24, color: "#79628d" }}>›</Typography></Pressable>{open ? <View className="gap-2 border-t border-line p-4"><Typography className="type-label text-muted">{EVENT_LABELS[event.type]}{lead ? ` · ${lead.label}` : ""} · {event.start}{event.end ? ` ～ ${event.end}` : ""}</Typography><View className="flex-row flex-wrap gap-2">{event.source ? <Button size="sm" variant="ghost" onPress={() => { setLinkError(null); void Linking.openURL(event.source!).catch(() => setLinkError("無法開啟公告，請確認網路連線。")); }}>官方公告 ↗</Button> : null}<Button size="sm" variant="ghost" onPress={() => void shareCalendarEvent(event)}>分享行事曆</Button>{canPlanScheduleEvent(event, today) ? <Button size="sm" variant="ghost" onPress={() => void planEvent(event)}>加入規劃</Button> : null}</View></View> : null}</Card>;
        })}</NativeColumns>
      </View>
      <NativeDisclosure title="月曆顯示與排期來源"><Typography className="type-label text-muted">{SCHEDULE_META.label} · 更新 {SCHEDULE_META.updated}。預測為非官方資訊，請以遊戲內公告為準。</Typography><View className="flex-row flex-wrap gap-2"><Button variant="secondary" onPress={() => setViewMode(showCalendar ? "list" : "calendar")}>{showCalendar ? "只看列表" : "顯示月曆"}</Button><Button variant="secondary" onPress={() => { setShowBars(!showBars); setViewMode("calendar"); }}>{showBars ? "圓點月曆" : "色條月曆"}</Button><Button variant="ghost" onPress={model.clearLeads}>清除全部男主</Button><Button variant="ghost" isDisabled={!model.selectedEvents.length} onPress={() => void shareVisibleCalendar()}>分享顯示排期</Button></View>        <View className="flex-row flex-wrap gap-x-3 gap-y-2 border-t border-line pt-3">
          {(Object.keys(EVENT_LABELS) as ScheduleEventType[]).map((type) => (
            <View key={type} className="flex-row items-center gap-1.5">
              <View className="h-2 w-2 rounded-full" style={{ backgroundColor: EVENT_COLORS[type] }} />
              <Typography className="type-label text-muted">{EVENT_LABELS[type]}</Typography>
            </View>
          ))}
        </View>
</NativeDisclosure>
    </NativePage>
  );
}

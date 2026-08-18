import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Pressable, Share, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Card, Typography } from "heroui-native";
import Svg, { Path, Rect } from "react-native-svg";

import { SCHEDULE_META } from "@/data/schedule";
import { pad, todayKey } from "@/domain/format";
import { EVENT_LABELS, eventStatus, scheduleEventCalendarFilename, scheduleEventToIcs, scheduleEventsToIcs } from "@/domain/schedule";
import { canPlanScheduleEvent } from "@/domain/planner";
import { LEADS, type ScheduleEvent, type ScheduleEventType } from "@/domain/types";
import { EVENT_COLORS, LEAD_COLORS } from "@/theme/tokens";
import { NativePage } from "@/ui/NativePage";
import { useScheduleModel } from "./useScheduleModel";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
const CELL_HEIGHT = 82;

const styles = StyleSheet.create({
  dayCell: {
    width: "14.2857%",
    height: CELL_HEIGHT,
    padding: 2,
  },
  eventBar: {
    position: "absolute",
    height: 12,
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
      <Svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
        <Rect x={3} y={4} width={18} height={16} rx={3} />
        <Path d="M8 2v4M16 2v4M3 9h18" />
      </Svg>
    );
  }
  if (type === "merch") {
    return (
      <Svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
      </Svg>
    );
  }
  return (
    <Svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 6a3 3 0 0 0 3 3 3 3 0 0 0 0 6 3 3 0 0 0-3 3h18a3 3 0 0 0-3-3 3 3 0 0 0 0-6 3 3 0 0 0 3-3Z" />
      <Path d="M13 6v12" />
    </Svg>
  );
}

function nativeLeadLabel(event: ScheduleEvent): { label: string; color: string } | null {
  if (!event.leads?.length) return null;
  if (event.leads.length === LEADS.length) return { label: "全員", color: "rgba(255,255,255,.5)" };
  if (event.leads.length > 1) return { label: "多人", color: "rgba(255,255,255,.5)" };
  return { label: event.leads[0], color: LEAD_COLORS[event.leads[0]] };
}

export function ScheduleScreenNative() {
  const model = useScheduleModel();
  const router = useRouter();
  const today = todayKey();
  const weeks = Math.ceil((model.calendar.leading + model.calendar.cells.length) / 7);
  const totalSlots = weeks * 7;
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
    <NativePage eyebrow={`${SCHEDULE_META.label} · 更新 ${SCHEDULE_META.updated}`} title="排期" description="官方公告與預測排期集中查看；虛線色條為排期預測。">
      {model.preferenceError ? <View accessibilityRole="alert" className="rounded-xl border border-[#ffafbd] bg-[#ff6675]/20 p-3"><Typography className="text-sm text-white">{model.preferenceError}</Typography></View> : null}
      {model.plannerError ? <View accessibilityRole="alert" className="rounded-xl border border-[#ffafbd] bg-[#ff6675]/20 p-3"><Typography className="text-sm text-white">{model.plannerError}</Typography></View> : null}
      <Card className="gap-4 border border-white/50 bg-[#493b70]/70 p-4">
        <View className="flex-row items-center justify-between">
          <Button accessibilityLabel="上個月" size="sm" variant="ghost" className="border border-white/45" onPress={model.previousMonth}>←</Button>
          <Typography.Heading className="text-2xl text-white">{model.year}年 {pad(model.monthIndex + 1)}月</Typography.Heading>
          <Button accessibilityLabel="下個月" size="sm" variant="ghost" className="border border-white/45" onPress={model.nextMonth}>→</Button>
        </View>
        {!model.isCurrentMonth ? <Button size="sm" variant="ghost" className="self-center border border-white/35" onPress={model.goToCurrentMonth}>回到本月</Button> : null}

        <View className="gap-2 rounded-2xl border border-white/35 bg-white/10 p-3">
          <View className="flex-row items-center justify-between">
            <Typography className="font-semibold text-white/90">男主篩選</Typography>
            <Typography className="text-xs text-white/55">{allLeadsSelected ? "已顯示全部" : `已選 ${model.selectedLeads.length} 位`}</Typography>
          </View>
          <View className="flex-row flex-wrap gap-2">
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: allLeadsSelected }}
              hitSlop={6}
              onPress={model.showAllLeads}
              className={`rounded-full border px-2 py-1.5 ${allLeadsSelected ? "border-white bg-white/20" : "border-white/35 bg-transparent"}`}
            >
              <Typography className="text-[10px] font-semibold text-white">全部</Typography>
            </Pressable>
            {LEADS.map((lead) => {
              const active = model.selectedLeads.includes(lead);
              return (
                <Pressable
                  key={lead}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  hitSlop={6}
                  onPress={() => model.toggleLead(lead)}
                  className="flex-row items-center gap-1 rounded-full border px-2 py-1.5"
                  style={{ borderColor: LEAD_COLORS[lead], backgroundColor: active ? `${LEAD_COLORS[lead]}22` : "transparent" }}
                >
                  <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: LEAD_COLORS[lead] }} />
                  <Typography className="text-[10px] font-semibold text-white">{lead}</Typography>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="flex-row">
          {WEEKDAYS.map((day) => (
            <View key={day} style={{ width: "14.2857%" }} className="items-center py-2">
              <Typography className="text-xs text-white/60">{day}</Typography>
            </View>
          ))}
        </View>

        <View className="relative flex-row flex-wrap" style={{ height: weeks * CELL_HEIGHT }}>
          {Array.from({ length: totalSlots }, (_, index) => {
            const day = index - model.calendar.leading + 1;
            const cell = day > 0 ? model.calendar.cells[day - 1] : undefined;
            if (!cell) return <View key={`blank-${index}`} style={styles.dayCell} />;
            const selected = cell.key === model.selectedDate;
            const isToday = cell.key === today;
            return (
              <View key={cell.key} style={styles.dayCell}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${cell.key}，${cell.eventCount} 個排期`}
                  accessibilityState={{ selected }}
                  onPress={() => model.selectDate(cell.key)}
                  className={`h-full items-center rounded-xl border pt-2 ${selected ? "border-white bg-white/20" : "border-white/5 bg-white/10"}`}
                >
                  <Typography className={`font-semibold ${isToday ? "text-white" : "text-white/85"}`}>{cell.day}</Typography>
                  {isToday ? <View className="mt-1 h-0.5 w-4 rounded-full bg-white" /> : null}
                </Pressable>
              </View>
            );
          })}
          <View pointerEvents="none" className="absolute inset-0">
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
                      top: segment.week * CELL_HEIGHT + 34 + segment.lane * 14,
                      left,
                      width,
                      backgroundColor: color,
                      borderColor: "rgba(255,255,255,0.72)",
                      borderWidth: segment.event.tentative ? 1 : 0,
                      borderStyle: segment.event.tentative ? "dashed" : "solid",
                    },
                  ]}
                >
                  <Typography numberOfLines={1} className="text-[8px] font-bold text-[#34294e]">{segment.event.name}</Typography>
                </View>
              );
            })}
          </View>
        </View>

        <View className="flex-row flex-wrap gap-x-3 gap-y-2 border-t border-white/25 pt-3">
          {(Object.keys(EVENT_LABELS) as ScheduleEventType[]).map((type) => (
            <View key={type} className="flex-row items-center gap-1.5">
              <View className="h-2 w-2 rounded-full" style={{ backgroundColor: EVENT_COLORS[type] }} />
              <Typography className="text-xs text-white/65">{EVENT_LABELS[type]}</Typography>
            </View>
          ))}
        </View>
      </Card>

      <Card className="gap-3 border border-white/50 bg-[#493b70]/70 p-4">
        <View className="flex-row items-center justify-between">
          <Typography.Heading className="text-xl text-white">
            {model.selectedDate ? `${Number(model.selectedDate.slice(5, 7))}月${Number(model.selectedDate.slice(8, 10))}日` : `${pad(model.monthIndex + 1)}月`} 排期
          </Typography.Heading>
          <View className="items-end gap-1">
            <Button size="sm" variant="ghost" isDisabled={!model.selectedEvents.length} onPress={() => void shareVisibleCalendar()}>分享顯示排期</Button>
            {model.selectedDate ? <Button size="sm" variant="ghost" onPress={model.clearSelection}>整月</Button> : null}
          </View>
        </View>
        {model.selectedEvents.length === 0 ? <Typography.Paragraph className="py-8 text-center text-white/60">{model.selectedDate ? "這天沒有排期" : "目前篩選沒有排期"}</Typography.Paragraph> : null}
        {model.selectedEvents.map((event, index) => {
          const status = eventStatus(event, today);
          const lead = nativeLeadLabel(event);
          const statusColor = status.tone === "live" ? "#65d6c4" : status.tone === "soon" ? "#ffd166" : "rgba(255,255,255,.45)";
          return (
            <View key={`${event.name}-${event.start}-${index}`} className="gap-2 border-b border-white/20 py-3">
              <View className="flex-row items-center justify-between gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-xl border border-white/50 bg-white/10">
                  <NativeEventIcon type={event.type} />
                </View>
                <View className="flex-1 gap-1">
                  <View className="flex-row flex-wrap items-center gap-1.5">
                    <Typography.Paragraph className="font-semibold text-white">{event.name}{event.tentative ? " · 預測" : ""}</Typography.Paragraph>
                    {lead ? (
                      <View className="rounded-full border px-2 py-0.5" style={{ borderColor: lead.color }}>
                        <Typography className="text-[9px] text-white/80">{lead.label}</Typography>
                      </View>
                    ) : null}
                  </View>
                  <Typography className="text-xs text-white/60">{EVENT_LABELS[event.type]} · {event.start}{event.end !== event.start ? ` ~ ${event.end}` : ""}</Typography>
                </View>
                <View className="rounded-full border px-2 py-1" style={{ borderColor: statusColor }}>
                  <Typography className="text-[10px] text-white">{status.label}</Typography>
                </View>
              </View>
              <View className="flex-row flex-wrap justify-end gap-2">
                <Button size="sm" variant="ghost" onPress={() => void shareCalendarEvent(event)}>分享行事曆</Button>
                {canPlanScheduleEvent(event, today) ? <Button size="sm" variant="ghost" onPress={() => void planEvent(event)}>加入規劃</Button> : null}
              </View>
            </View>
          );
        })}
      </Card>
    </NativePage>
  );
}

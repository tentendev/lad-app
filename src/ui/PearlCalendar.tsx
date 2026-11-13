import { Pressable, View } from "react-native";
import { Typography } from "./NativeComponents";
import { PearlSurface } from "./PearlSurface";
import { eventsForDate, type CalendarCell } from "@/domain/schedule";
import type { ScheduleEvent } from "@/domain/types";
import { EVENT_COLORS } from "@/theme/tokens";
import { NATIVE_FONTS } from "@/theme/native";
export function PearlCalendar({
  calendar,
  events,
  selected,
  today,
  onSelect,
}: {
  calendar: { leading: number; cells: CalendarCell[] };
  events: ScheduleEvent[];
  selected: string | null;
  today: string;
  onSelect: (key: string) => void;
}) {
  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          borderBottomWidth: 1,
          borderBottomColor: "#e6ddec",
          paddingBottom: 9,
        }}
      >
        {["日", "一", "二", "三", "四", "五", "六"].map((day, index) => (
          <View key={day} style={{ width: "14.2857%", alignItems: "center" }}>
            <Typography
              style={{
                color: index === 0 ? "#9473b0" : "#655572",
                fontSize: 15,
              }}
            >
              {day}
            </Typography>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", paddingTop: 4 }}>
        {Array.from({ length: calendar.leading }, (_, i) => (
          <View key={`blank${i}`} style={{ width: "14.2857%", height: 48 }} />
        ))}
        {calendar.cells.map((cell) => {
          const active = cell.key === (selected ?? today);
          const types = [
            ...new Set(
              eventsForDate(events, cell.key).map((event) => event.type),
            ),
          ].slice(0, 3);
          return (
            <View
              key={cell.key}
              style={{ width: "14.2857%", alignItems: "center", height: 48 }}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${cell.key}，${cell.eventCount} 個排期`}
                accessibilityState={{ selected: cell.key === selected }}
                onPress={() => onSelect(cell.key)}
                style={{
                  width: 44,
                  minHeight: 44,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 12,
                  overflow: "hidden",
                  gap: 2,
                }}
              >
                {active ? <PearlSurface tone="primary" /> : null}
                <Typography
                  style={{
                    fontFamily: NATIVE_FONTS.number,
                    fontSize: 21,
                    lineHeight: 25,
                    color: active
                      ? "#fff"
                      : cell.weekday === 0
                        ? "#9270b2"
                        : "#30213f",
                  }}
                >
                  {cell.day}
                </Typography>
                <View style={{ flexDirection: "row", gap: 2, minHeight: 5 }}>
                  {types.map((type) => (
                    <View
                      key={type}
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: 3,
                        backgroundColor: active ? "#fff" : EVENT_COLORS[type],
                        opacity: 0.7,
                      }}
                    />
                  ))}
                </View>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

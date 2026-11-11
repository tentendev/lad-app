import { useState } from "react";
import { Modal, Platform, Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Button, Typography } from "@/ui/NativeComponents";
import { toDateKey, isValidDateKey, todayKey } from "@/domain/format";

export function NativeDateField({ label, value, onChange, disabled = false }: {
  label: string; value: string; onChange: (value: string) => void; disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(new Date());
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const tablet = width >= 768;
  function show() {
    const key = isValidDateKey(value) ? value : todayKey();
    const [year, month, day] = key.split("-").map(Number);
    setPending(new Date(year, month - 1, day, 12));
    setOpen(true);
  }
  return <View className="gap-2">
    <Typography className="type-label text-muted">{label}</Typography>
    <Pressable accessibilityRole="button" accessibilityLabel={`${label}，${value || "選擇日期"}`} accessibilityState={{ disabled, expanded: open }} disabled={disabled} onPress={show} className="min-h-12 flex-row flex-wrap items-center justify-between gap-2 rounded-[13px] border border-white/55 bg-white/[0.14] px-3 py-3">
      <Typography className="type-body text-white">{value || "選擇日期"}</Typography><Typography className="text-muted">⌄</Typography>
    </Pressable>
    {open && Platform.OS === "android" ? <DateTimePicker value={pending} mode="date" onChange={(event, next) => { setOpen(false); if (event.type === "set" && next) onChange(toDateKey(next)); }} /> : null}
    {Platform.OS !== "android" ? <Modal visible={open} transparent animationType="slide" supportedOrientations={["portrait", "portrait-upside-down", "landscape-left", "landscape-right"]} onRequestClose={() => setOpen(false)}>
      <View className="flex-1 bg-black/50" style={{ justifyContent: tablet ? "center" : "flex-end", paddingTop: insets.top, paddingHorizontal: tablet ? 24 : 0 }}>
        <ScrollView accessibilityViewIsModal style={{ width: "100%", maxWidth: 520, maxHeight: height - insets.top - insets.bottom, flexGrow: 0, alignSelf: "center", borderRadius: 24, backgroundColor: "#34294e" }} contentContainerStyle={{ gap: 12, padding: 20, paddingBottom: Math.max(20, insets.bottom) }}>
          <Typography accessibilityRole="header" className="type-title font-semibold text-white">{label}</Typography><View className="flex-row flex-wrap items-center justify-between gap-2"><Button variant="ghost" onPress={() => setOpen(false)}>取消</Button><Button variant="secondary" onPress={() => { onChange(toDateKey(pending)); setOpen(false); }}>完成</Button></View>
          <DateTimePicker style={{ width: Math.min(320, width - 40), alignSelf: "center" }} value={pending} mode="date" display="spinner" locale="zh-TW" themeVariant="dark" onChange={(_, next) => { if (next) setPending(next); }} />
        </ScrollView>
      </View>
    </Modal> : null}
  </View>;
}

import { useState } from "react";
import { Modal, Platform, Pressable, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Button, Typography } from "heroui-native";
import { toDateKey, isValidDateKey, todayKey } from "@/domain/format";

export function NativeDateField({ label, value, onChange, disabled = false }: {
  label: string; value: string; onChange: (value: string) => void; disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(new Date());
  function show() {
    const key = isValidDateKey(value) ? value : todayKey();
    const [year, month, day] = key.split("-").map(Number);
    setPending(new Date(year, month - 1, day, 12));
    setOpen(true);
  }
  return <View className="gap-2">
    <Typography className="text-sm text-white/75">{label}</Typography>
    <Pressable accessibilityRole="button" accessibilityLabel={`${label}，${value || "選擇日期"}`} accessibilityState={{ disabled, expanded: open }} disabled={disabled} onPress={show} className="min-h-12 flex-row items-center justify-between rounded-xl border border-white/30 bg-white/10 px-4 py-3">
      <Typography className="text-base text-white">{value || "選擇日期"}</Typography><Typography className="text-white/60">⌄</Typography>
    </Pressable>
    {open && Platform.OS === "android" ? <DateTimePicker value={pending} mode="date" onChange={(event, next) => { setOpen(false); if (event.type === "set" && next) onChange(toDateKey(next)); }} /> : null}
    {Platform.OS !== "android" ? <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
      <View className="flex-1 justify-end bg-black/50">
        <View accessibilityViewIsModal className="gap-3 rounded-t-3xl bg-[#34294e] px-5 pb-10 pt-5">
          <View className="flex-row items-center justify-between"><Button variant="ghost" onPress={() => setOpen(false)}>取消</Button><Typography accessibilityRole="header" className="font-semibold text-white">{label}</Typography><Button variant="secondary" onPress={() => { onChange(toDateKey(pending)); setOpen(false); }}>完成</Button></View>
          <DateTimePicker value={pending} mode="date" display="spinner" locale="zh-TW" themeVariant="dark" onChange={(_, next) => { if (next) setPending(next); }} />
        </View>
      </View>
    </Modal> : null}
  </View>;
}

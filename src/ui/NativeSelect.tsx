import { useState } from "react";
import { Modal, Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import { Typography } from "@/ui/NativeComponents";

type Props<T extends string> = {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  formatOption?: (value: T) => string;
  disabled?: boolean;
  compact?: boolean;
};

/** Website-style select field with a scrollable, touch-friendly native sheet. */
export function NativeSelect<T extends string>({ label, value, options, onChange, formatOption, disabled = false, compact = false }: Props<T>) {
  const [open, setOpen] = useState(false);
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const display = (option: T) => formatOption?.(option) ?? option;

  return <View className={compact ? "flex-row flex-wrap items-center gap-2" : "gap-2"}>
    <Typography className="type-label text-muted">{label}</Typography>
    <Pressable accessibilityRole="button" accessibilityLabel={`${label}，${display(value)}`} accessibilityState={{ disabled, expanded: open }} disabled={disabled} onPress={() => setOpen(true)} className={`${compact ? "flex-1" : ""} min-h-12 flex-row items-center justify-between gap-3 rounded-[13px] border border-line bg-white/80 px-3 py-3 ${disabled ? "opacity-45" : ""}`}>
      <Typography className="flex-1 type-body text-ink">{display(value)}</Typography>
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#80639f" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><Path d="m6 9 6 6 6-6" /></Svg>
    </Pressable>
    {open ? <Modal transparent animationType="slide" onRequestClose={() => setOpen(false)}>
      <View className="flex-1 justify-end bg-black/50">
        <Pressable accessible={false} onPress={() => setOpen(false)} className="absolute inset-0" />
        <View accessibilityViewIsModal className="w-full self-center rounded-t-[20px] border border-line bg-[#fbf9fe]" style={{ maxWidth: 520, maxHeight: height * 0.8, paddingBottom: Math.max(16, insets.bottom) }}>
          <View className="flex-row items-center justify-between gap-3 border-b border-line px-4 py-2">
            <Typography accessibilityRole="header" className="flex-1 type-title-sm text-ink">{label}</Typography>
            <Pressable accessibilityRole="button" accessibilityLabel={`取消選擇${label}`} onPress={() => setOpen(false)} className="min-h-12 min-w-12 items-center justify-center"><Typography className="type-body text-ink">取消</Typography></Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" style={{ flexGrow: 0, flexShrink: 1 }} contentContainerStyle={{ padding: 12, gap: 6 }}>
            {options.map(option => <Pressable key={option} accessibilityRole="radio" accessibilityState={{ checked: option === value }} onPress={() => { onChange(option); setOpen(false); }} className={`min-h-12 flex-row items-center justify-between gap-3 rounded-[13px] border px-3 py-3 ${option === value ? "border-line bg-orbit/10" : "border-transparent"}`}>
              <Typography className="flex-1 type-body text-ink">{display(option)}</Typography>
              {option === value ? <Typography className="type-body text-ink">✓</Typography> : null}
            </Pressable>)}
          </ScrollView>
        </View>
      </View>
    </Modal> : null}
  </View>;
}

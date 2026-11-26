import { useState, type PropsWithChildren } from "react";
import { Pressable, View } from "react-native";
import Animated, { FadeIn, FadeOut, ReduceMotion } from "react-native-reanimated";
import { Typography } from "@/ui/NativeComponents";

export function NativeDisclosure({ title, children, open: controlledOpen, onOpenChange }: PropsWithChildren<{ title: string; open?: boolean; onOpenChange?: (open: boolean) => void }>) {
  const [localOpen, setLocalOpen] = useState(false);
  const open = controlledOpen ?? localOpen;
  const setOpen = onOpenChange ?? setLocalOpen;
  return <View className="gap-3">
    <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen(!open)} className="min-h-12 flex-row items-center justify-between gap-3">
      <Typography.Heading type="h4" className="flex-1 type-title-sm text-ink">{title}</Typography.Heading>
      <Typography className="type-body text-muted">{open ? "⌃" : "⌄"}</Typography>
    </Pressable>
    {open ? <Animated.View entering={FadeIn.duration(180).reduceMotion(ReduceMotion.System)} exiting={FadeOut.duration(120).reduceMotion(ReduceMotion.System)} className="gap-3 border-t border-line pt-3">{children}</Animated.View> : null}
  </View>;
}

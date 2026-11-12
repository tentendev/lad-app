import { useState, type PropsWithChildren } from "react";
import { Pressable, View } from "react-native";
import { Typography } from "@/ui/NativeComponents";

export function NativeDisclosure({ title, children }: PropsWithChildren<{ title: string }>) {
  const [open, setOpen] = useState(false);
  return <View className="gap-3">
    <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen(!open)} className="min-h-12 flex-row items-center justify-between gap-3">
      <Typography.Heading type="h4" className="flex-1 type-title-sm text-ink">{title}</Typography.Heading>
      <Typography className="type-body text-muted">{open ? "⌃" : "⌄"}</Typography>
    </Pressable>
    {open ? <View className="gap-3 border-t border-line pt-3">{children}</View> : null}
  </View>;
}

import { Modal, Pressable, ScrollView, useWindowDimensions, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Typography } from "./NativeComponents";
import { useSiteUpdates } from "./SiteUpdatesProvider";

export function SiteUpdatesEntry() {
  const { latest, ready, unread, open } = useSiteUpdates();
  if (!latest) return null;
  return <Pressable accessibilityRole="button" accessibilityLabel={unread ? "查看最近更新，有新更新" : "查看最近更新"} accessibilityState={{ disabled: !ready }} disabled={!ready} onPress={open} className="size-12 items-center justify-center rounded-full border border-white/30 bg-[#382a60]/70">
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><Path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></Svg>
    {unread ? <View className="absolute right-1 top-1 size-2 rounded-full bg-[#ffb3df]" /> : null}
  </Pressable>;
}

export function SiteUpdatesDialog() {
  const { latest, unread, visible, dismiss } = useSiteUpdates();
  const { height } = useWindowDimensions();
  if (!latest) return null;
  return <Modal transparent visible={visible} animationType="fade" onRequestClose={dismiss}>
    <View className="flex-1 items-center justify-center bg-[#160e2a]/75 px-4">
      <View accessibilityViewIsModal className="w-full overflow-hidden rounded-3xl border border-white/55 bg-[#312254]" style={{ maxWidth: 440, maxHeight: height * 0.8 }}>
        <View className="flex-row items-start justify-between gap-3 border-b border-white/25 p-5">
          <View className="flex-1 gap-2"><View className="flex-row flex-wrap items-center gap-2"><Typography accessibilityRole="header" className="type-title-sm font-semibold text-white">最近更新</Typography>{unread ? <View className="rounded-md border border-[#ffb3df] px-2 py-1"><Typography className="type-label text-white">新更新</Typography></View> : null}</View><Typography className="type-label text-muted">{latest.date.replaceAll("-", "/")}</Typography></View>
          <Pressable accessibilityRole="button" accessibilityLabel="關閉最近更新" onPress={dismiss} className="size-12 shrink-0 items-center justify-center rounded-xl border border-white/30"><Typography className="type-title text-white">×</Typography></Pressable>
        </View>
        <ScrollView style={{ flexGrow: 0, flexShrink: 1 }} contentContainerStyle={{ padding: 20, gap: 20 }}>
          {latest.items.map((item, index) => <View key={index} className="gap-2"><View className="self-start rounded-md border border-white/25 px-2 py-1"><Typography className="type-label text-[#65d6c4]">{item.type === "schedule" ? "排期" : "功能"}</Typography></View><Typography className="type-body font-semibold text-white">{item.title}</Typography><Typography className="type-body text-muted">{item.body}</Typography></View>)}
          <Pressable accessibilityRole="button" onPress={dismiss} className="min-h-12 items-center justify-center rounded-xl border border-white/55 px-3 py-3"><Typography className="type-body text-white">知道了</Typography></Pressable>
        </ScrollView>
      </View>
    </View>
  </Modal>;
}

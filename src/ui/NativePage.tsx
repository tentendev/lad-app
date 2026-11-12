import { Typography } from "@/ui/NativeComponents";
import type { PropsWithChildren } from "react";
import { Link } from "expo-router";
import { Linking, KeyboardAvoidingView, Platform, ScrollView, Pressable, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Ellipse, Path } from "react-native-svg";
import { NATIVE_FONTS } from "@/theme/native";
import { APP_COLORS } from "@/theme/tokens";
import { OrbitBackdrop } from "./OrbitBackdrop";

import { AccountEntry } from "@/ui/AccountEntry";
import { SiteUpdatesEntry } from "@/ui/SiteUpdates";
import { nativePageLayout } from "./nativeLayout";

type Props = PropsWithChildren<{
  eyebrow: string;
  title: string;
  description: string;
  showAccountEntry?: boolean;
  showAboutLink?: boolean;
  workspace?: boolean;
}>;

export function NativePage({ title, showAccountEntry = true, showAboutLink = true, workspace = false, children }: Props) {
  const { width } = useWindowDimensions();
  const layout = nativePageLayout(width, workspace);
  const motto = ({ 錢包: "把喜歡，留在計畫裡。", 換算: "離心願，再近一點。", 追蹤: "記下每次心動的軌跡。", 會員中心: "把計畫，好好保存。" } as Record<string, string>)[title];
  return (
    <View style={{ flex: 1, backgroundColor: APP_COLORS.canvas }}>
      <OrbitBackdrop />
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}><ScrollView
          contentContainerStyle={{ paddingHorizontal: layout.horizontalPadding, paddingTop: 8, paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View className="w-full self-center" style={{ maxWidth: layout.maxWidth, gap: 14 }}>
            <View className="relative flex-row items-center pb-3" style={{ minHeight: 72, paddingRight: 108, gap: 5 }}>
              <View className="absolute right-14 top-0"><SiteUpdatesEntry /></View>
              {showAccountEntry ? <View className="absolute right-0 top-0"><AccountEntry /></View> : null}
              <View accessible={false} pointerEvents="none">
                <Svg width={28} height={28} viewBox="0 0 48 48" fill="none" stroke={APP_COLORS.accent} strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round"><Ellipse cx={24} cy={24} rx={21} ry={8} rotation={-35} origin="24,24" /><Path d="M32 4v8M28 8h8" /></Svg>
              </View>
              <Typography accessibilityRole="header" accessibilityLabel={`深空省省，${title}`} style={{ flexShrink: 1, color: APP_COLORS.text, fontFamily: NATIVE_FONTS.heading, fontSize: 23, lineHeight: 34, fontWeight: "600", letterSpacing: 2 }}>深空省省</Typography>
            </View>
            {motto ? <Typography style={{ fontFamily: NATIVE_FONTS.heading, color: APP_COLORS.text, fontSize: 26, lineHeight: 40, marginBottom: 8, fontWeight: "600" }}>{motto}</Typography> : null}
            {children}
            {showAboutLink ? (
              <View className="flex-row flex-wrap items-center justify-center gap-3 py-3">
                {([
                  ["/account", "會員中心"], ["/about", "關於"], ["/privacy", "隱私政策"], ["/support", "支援"],
                ] as const).map(([href, label]) => <Link key={href} href={href} asChild><Pressable className="min-h-12 min-w-12 items-center justify-center px-2"><Typography className="type-label text-muted underline">{label}</Typography></Pressable></Link>)}
                <Pressable accessibilityRole="link" accessibilityLabel="製作：@chumei_0218" onPress={() => void Linking.openURL("https://www.threads.com/@chumei_0218")} className="min-h-12 items-center justify-center px-2"><Typography className="type-label text-muted underline">製作：@chumei_0218</Typography></Pressable>
              </View>
            ) : null}
          </View>
        </ScrollView></KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

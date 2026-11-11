import { Typography } from "@/ui/NativeComponents";
import type { PropsWithChildren } from "react";
import { Link } from "expo-router";
import { ImageBackground, Linking, KeyboardAvoidingView, Platform, ScrollView, Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import { NATIVE_FONTS } from "@/theme/native";

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
  return (
    <ImageBackground
      source={require("../../public/lad-bg.webp")}
      resizeMode="cover"
      className="flex-1 bg-[#7765a7]"
    >
      <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
        <Defs><LinearGradient id="page-shade" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#2a1e48" stopOpacity={0.06} /><Stop offset="1" stopColor="#281c42" stopOpacity={0.34} /></LinearGradient></Defs>
        <Rect width="100" height="100" fill="url(#page-shade)" />
      </Svg>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}><ScrollView
          contentContainerStyle={{ paddingHorizontal: layout.horizontalPadding, paddingTop: 8, paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View className="w-full self-center" style={{ maxWidth: layout.maxWidth, gap: 14 }}>
            <View className="relative items-center pb-3" style={{ minHeight: 104 }}>
              <View className="absolute left-0 top-0"><SiteUpdatesEntry /></View>
              {showAccountEntry ? <View className="absolute right-0 top-0"><AccountEntry /></View> : null}
              <View accessible={false} pointerEvents="none">
                <Svg width={40} height={40} viewBox="0 0 48 48" fill="none" stroke="white" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round"><Path d="M24 6l4 7h-8zM16 13h16l8 11-16 17L8 24z"/><Path d="M8 24h32M16 13l8 28M32 13l-8 28M20 13l4 6 4-6"/></Svg>
              </View>
              <Typography accessibilityRole="header" accessibilityLabel={`深空省省，${title}`} className="text-center text-white" style={{ fontFamily: NATIVE_FONTS.heading, fontSize: 21, lineHeight: 32, fontWeight: "600", letterSpacing: 8, paddingLeft: 8 }}>深空省省</Typography>
              <Typography className="type-label text-center text-muted" style={{ marginTop: 3, letterSpacing: 2 }}>你的抽卡與課金規劃好幫手</Typography>
            </View>
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
    </ImageBackground>
  );
}

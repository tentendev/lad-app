import type { PropsWithChildren } from "react";
import { Link } from "expo-router";
import { ImageBackground, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AccountEntry } from "@/ui/AccountEntry";

type Props = PropsWithChildren<{
  eyebrow: string;
  title: string;
  description: string;
  showAccountEntry?: boolean;
  showAboutLink?: boolean;
}>;

export function NativePage({ eyebrow, title, description, showAccountEntry = true, showAboutLink = true, children }: Props) {
  return (
    <ImageBackground
      accessibilityLabel={`${title}頁面星空背景`}
      source={require("../../public/mobile-bg.webp")}
      resizeMode="cover"
      className="flex-1 bg-[#7765a7]"
    >
      <View className="absolute inset-0 bg-[#574978]/30" />
      <SafeAreaView className="flex-1" edges={["top"]} accessibilityLabel={`${title}：${description}；${eyebrow}`}>
        <ScrollView
          contentContainerClassName="px-4 pb-28 pt-4"
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full self-center" style={{ maxWidth: 520, gap: 16 }}>
            {showAccountEntry ? <AccountEntry /> : null}
            {children}
            {showAboutLink ? (
              <View className="flex-row flex-wrap items-center justify-center gap-3 py-3">
                <Link href="/account" className="text-xs text-white/65 underline">會員中心</Link>
                <View className="h-3 w-px bg-white/30" />
                <Link href="/about" className="text-xs text-white/65 underline">關於</Link>
                <View className="h-3 w-px bg-white/30" />
                <Link href="/privacy" className="text-xs text-white/65 underline">隱私政策</Link>
                <View className="h-3 w-px bg-white/30" />
                <Link href="/support" className="text-xs text-white/65 underline">支援</Link>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

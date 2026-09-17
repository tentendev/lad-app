import { Typography } from "@/ui/NativeComponents";
import type { PropsWithChildren } from "react";
import { Link } from "expo-router";
import { Image, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AccountEntry } from "@/ui/AccountEntry";

type Props = PropsWithChildren<{
  eyebrow: string;
  title: string;
  description: string;
  showAccountEntry?: boolean;
  showAboutLink?: boolean;
}>;

export function NativePage({ title, showAccountEntry = true, showAboutLink = true, children }: Props) {
  return (
    <ImageBackground
      source={require("../../public/mobile-bg.webp")}
      resizeMode="cover"
      className="flex-1 bg-[#7765a7]"
    >
      <View className="absolute inset-0 bg-[#241b42]/75" />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}><ScrollView
          contentContainerClassName="px-4 pb-12 pt-4"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View className="w-full self-center" style={{ maxWidth: 520, gap: 16 }}>
            <View className="flex-row flex-wrap items-center justify-between gap-3">
              <View className="flex-row items-center gap-2"><Image source={require("../../assets/generated/ios-launch/brand-mark.png")} style={{ width: 36, height: 36, borderRadius: 10 }} accessible={false} /><Typography className="type-title-sm font-semibold text-white">深空省省</Typography></View>
              {showAccountEntry ? <AccountEntry /> : null}
            </View>
            <Typography accessibilityRole="header" className="type-headline font-semibold text-white">{title}</Typography>
            {children}
            {showAboutLink ? (
              <View className="flex-row flex-wrap items-center justify-center gap-3 py-3">
                {([
                  ["/account", "會員中心"], ["/about", "關於"], ["/privacy", "隱私政策"], ["/support", "支援"],
                ] as const).map(([href, label]) => <Link key={href} href={href} asChild><Pressable className="min-h-12 min-w-12 items-center justify-center px-2"><Typography className="type-label text-muted underline">{label}</Typography></Pressable></Link>)}
              </View>
            ) : null}
          </View>
        </ScrollView></KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

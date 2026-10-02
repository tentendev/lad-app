import { WelcomeScreen } from "@/ui/WelcomeScreen";
import type { JSX } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { HeroUINativeProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { APP_COLORS } from "@/theme/tokens";
import { ClerkAppProvider } from "@/auth/ClerkAppProvider";
import { SiteUpdatesProvider } from "@/ui/SiteUpdatesProvider";
import { SiteUpdatesDialog } from "@/ui/SiteUpdates";
import "../native.css";

export default function RootLayout(): JSX.Element {
  return (
    <ClerkAppProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <HeroUINativeProvider config={{ textProps: { allowFontScaling: true, maxFontSizeMultiplier: 0, adjustsFontSizeToFit: false } }}>
          <SiteUpdatesProvider deferAutoOpen>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: APP_COLORS.canvas } }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="account" />
            <Stack.Screen name="sso-callback" />
          </Stack>
          <WelcomeScreen />
          <SiteUpdatesDialog />
          <StatusBar style="light" />
          </SiteUpdatesProvider>
        </HeroUINativeProvider>
      </GestureHandlerRootView>
    </ClerkAppProvider>
  );
}

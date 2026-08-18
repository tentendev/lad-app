import type { JSX } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { HeroUINativeProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { APP_COLORS } from "@/theme/tokens";
import { ClerkAppProvider } from "@/auth/ClerkAppProvider";
import "../native.css";

export default function RootLayout(): JSX.Element {
  return (
    <ClerkAppProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <HeroUINativeProvider>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: APP_COLORS.canvas } }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="account" />
            <Stack.Screen name="sso-callback" />
          </Stack>
          <StatusBar style="light" />
        </HeroUINativeProvider>
      </GestureHandlerRootView>
    </ClerkAppProvider>
  );
}

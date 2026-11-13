import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { JSX } from "react";
import type { ColorValue } from "react-native";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

import { PearlSurface } from "@/ui/PearlSurface";
import { APP_COLORS } from "@/theme/tokens";

type IconName = "wallet" | "calendar" | "calculator" | "star" | "feedback";

function TabIcon({ name, color }: { name: IconName; color: ColorValue }): JSX.Element {
  if (name === "feedback") return <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><Path d="M21 11a8 8 0 0 1-8 8H9l-6 3 2-6a8 8 0 1 1 16-5Z"/><Path d="M8 9h8M8 13h5"/></Svg>;
  if (name === "wallet") {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        <Rect x={3} y={6} width={18} height={13} rx={2} />
        <Path d="M3 10h18M16 14h2" />
      </Svg>
    );
  }
  if (name === "calendar") {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        <Rect x={3} y={4} width={18} height={17} rx={2} />
        <Path d="M8 2v4M16 2v4M3 9h18" />
      </Svg>
    );
  }
  if (name === "star") {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M4 20V13h3v7M11 20V7h3v13M18 20V3h3v17" />
      </Svg>
    );
  }
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 7h18m-5-5 5 5-5 5M21 17H3m5-5-5 5 5 5" />
    </Svg>
  );
}

export default function NativeTabsLayout(): JSX.Element {
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();
  return (
    <Tabs
      initialRouteName="schedule"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: APP_COLORS.accent,
        tabBarInactiveTintColor: APP_COLORS.muted,
        tabBarActiveBackgroundColor: "transparent",
        tabBarButton: props => <Pressable onPress={props.onPress} onLongPress={props.onLongPress} onLayout={props.onLayout} testID={props.testID} accessibilityRole="tab" accessibilityLabel={props.accessibilityLabel} accessibilityState={props.accessibilityState} style={props.style}>{state => <>{props.accessibilityState?.selected ? <View pointerEvents="none" style={{ position: "absolute", inset: 0, borderRadius: 15, overflow: "hidden", boxShadow: "inset 0px 1px 1px #fff" }}><PearlSurface tone="lavender"/></View> : null}{typeof props.children === "function" ? props.children(state) : props.children}</>}</Pressable>,
        tabBarBackground: () => <View style={{ flex: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden" }}><PearlSurface/></View>,
        tabBarLabel: ({ children, color, focused }) => <Text key={fontScale} allowFontScaling maxFontSizeMultiplier={2} style={{ fontSize: 14, lineHeight: 20, fontWeight: focused ? "600" : "400", color, textAlign: "center" }}>{children}</Text>,
        tabBarLabelPosition: "below-icon",
        tabBarItemStyle: { paddingTop: 5, marginHorizontal: 10, marginTop: 7, marginBottom: 5, borderRadius: 15 },
        tabBarStyle: {
          width: "100%",
          backgroundColor: APP_COLORS.navigation,
          borderTopColor: APP_COLORS.line,
          borderTopWidth: 1,
          borderTopLeftRadius: 24, borderTopRightRadius: 24,
          boxShadow: "0px -5px 22px rgba(103,76,134,0.08), inset 0px 1px 1px #fff",
          height: 52 + 20 * Math.min(fontScale, 2) + insets.bottom,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen
        name="wallet"
        options={{ title: "錢包", tabBarAccessibilityLabel: "錢包，第 1 個分頁，共 4 個", tabBarIcon: ({ color }) => <TabIcon name="wallet" color={color} /> }}
      />
      <Tabs.Screen
        name="schedule"
        options={{ title: "排期", tabBarAccessibilityLabel: "排期，第 2 個分頁，共 4 個", tabBarIcon: ({ color }) => <TabIcon name="calendar" color={color} /> }}
      />
      <Tabs.Screen
        name="calculator"
        options={{ title: "換算", tabBarAccessibilityLabel: "換算，第 3 個分頁，共 4 個", tabBarIcon: ({ color }) => <TabIcon name="calculator" color={color} /> }}
      />
      <Tabs.Screen
        name="tracker"
        options={{ title: "追蹤", tabBarAccessibilityLabel: "追蹤，第 4 個分頁，共 4 個", tabBarIcon: ({ color }) => <TabIcon name="star" color={color} /> }}
      />
      <Tabs.Screen name="feedback" options={{ href: null }} />
    </Tabs>
  );
}

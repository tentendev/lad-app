import { Tabs } from "expo-router";
import type { JSX } from "react";
import type { ColorValue } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";

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
        <Path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />
      </Svg>
    );
  }
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <Path d="m12 3 8 7-8 11L4 10Z" />
      <Path d="M4 10h16M8 4.8 12 10l4-5.2M8 10l4 11 4-11" />
    </Svg>
  );
}

export default function NativeTabsLayout(): JSX.Element {
  return (
    <Tabs
      initialRouteName="schedule"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "rgba(255,255,255,0.58)",
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600", marginTop: 2 },
        tabBarItemStyle: { paddingTop: 5 },
        tabBarStyle: {
          width: "100%",
          maxWidth: 520,
          alignSelf: "center",
          backgroundColor: APP_COLORS.navigation,
          borderTopColor: "rgba(255,255,255,0.34)",
          borderTopWidth: 1,
          borderLeftColor: "rgba(255,255,255,0.2)",
          borderLeftWidth: 1,
          borderRightColor: "rgba(255,255,255,0.2)",
          borderRightWidth: 1,
          height: 70,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen
        name="wallet"
        options={{ title: "錢包", tabBarIcon: ({ color }) => <TabIcon name="wallet" color={color} /> }}
      />
      <Tabs.Screen
        name="schedule"
        options={{ title: "排期", tabBarIcon: ({ color }) => <TabIcon name="calendar" color={color} /> }}
      />
      <Tabs.Screen
        name="calculator"
        options={{ title: "換算", tabBarIcon: ({ color }) => <TabIcon name="calculator" color={color} /> }}
      />
      <Tabs.Screen
        name="tracker"
        options={{ title: "追蹤", tabBarIcon: ({ color }) => <TabIcon name="star" color={color} /> }}
      />
      <Tabs.Screen name="feedback" options={{ title: "回饋", tabBarIcon: ({ color }) => <TabIcon name="feedback" color={color} /> }} />
    </Tabs>
  );
}

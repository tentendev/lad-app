import { useId } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

/** Real vector gradients on iOS and Android; no screenshot baked into the UI. */
export function PearlSurface({
  tone = "glass",
}: {
  tone?: "glass" | "lavender" | "primary";
}) {
  const id = `pearl${useId().replace(/:/g, "")}`;
  const colors =
    tone === "primary"
      ? ["#b39ac9", "#9e80b8", "#9372ac"]
      : tone === "lavender"
        ? ["#faf7ff", "#e6dcf3", "#f4eef9"]
        : ["#ffffff", "#fbf9fe", "#f3eef9"];
  return (
    <View
      pointerEvents="none"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        StyleSheet.absoluteFill,
        { overflow: "hidden", borderRadius: 16 },
      ]}
    >
      <Svg
        width="100%"
        height="100%"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors[0]} stopOpacity={0.95} />
            <Stop offset=".52" stopColor={colors[1]} stopOpacity={0.84} />
            <Stop offset="1" stopColor={colors[2]} stopOpacity={0.93} />
          </LinearGradient>
          <LinearGradient id={`${id}shine`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#fff" stopOpacity={0.55} />
            <Stop offset=".13" stopColor="#fff" stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Rect width="100" height="100" fill={`url(#${id})`} />
        <Rect width="100" height="100" fill={`url(#${id}shine)`} />
      </Svg>
    </View>
  );
}

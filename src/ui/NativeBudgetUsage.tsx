import { useEffect } from "react";
import { View } from "react-native";
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Typography } from "./NativeComponents";

export function NativeBudgetUsage({ percentage, threshold = 80 }: { percentage: number; threshold?: number }) {
  const width = useSharedValue(0);
  useEffect(() => { width.set(withTiming(Math.min(100, Math.max(0, percentage)), { duration: 500, reduceMotion: ReduceMotion.System })); }, [percentage, width]);
  const style = useAnimatedStyle(() => ({ width: `${width.get()}%` as `${number}%` }));
  return <View style={{ gap: 8 }}>
    <Typography className="type-label text-muted">使用 {percentage}%</Typography>
    <View accessibilityRole="progressbar" accessibilityLabel="當月預算使用率" accessibilityValue={{ min: 0, max: 100, now: Math.min(100, Math.max(0, percentage)), text: `已使用 ${percentage}%` }} style={{ height: 9, overflow: "hidden", borderRadius: 99, backgroundColor: "#e8e1f0" }}>
      <Animated.View style={[{ height: "100%", borderRadius: 99, backgroundColor: percentage >= 100 ? "#b95877" : percentage >= threshold ? "#ba9657" : "#aa8cc1" }, style]} />
    </View>
  </View>;
}

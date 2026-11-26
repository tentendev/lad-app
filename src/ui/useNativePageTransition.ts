import { useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { cancelAnimation, Easing, ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

export function useNativePageTransition() {
  const progress = useSharedValue(1);
  useFocusEffect(useCallback(() => {
    progress.set(0);
    progress.set(withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic), reduceMotion: ReduceMotion.System }));
    return () => cancelAnimation(progress);
  }, [progress]));
  return useAnimatedStyle(() => { const value = progress.get(); return { opacity: value, transform: [{ translateY: (1 - value) * 6 }] }; });
}

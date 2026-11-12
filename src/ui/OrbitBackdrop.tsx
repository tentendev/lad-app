import { StyleSheet, View } from "react-native";
import Svg, { Defs, Ellipse, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import { APP_COLORS } from "@/theme/tokens";

/** Original vector decoration for 02A: quiet pearl mist and fine orbital lines. */
export function OrbitBackdrop() {
  return <View pointerEvents="none" accessible={false} style={[StyleSheet.absoluteFill, { backgroundColor: APP_COLORS.canvas }]}>
    <Svg width="100%" height="100%" viewBox="0 0 400 900" preserveAspectRatio="xMidYMin slice">
      <Defs>
        <LinearGradient id="pearl-mist" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#eee8f7" /><Stop offset=".45" stopColor="#fbf9fc" /><Stop offset="1" stopColor="#e4edf7" /></LinearGradient>
        <LinearGradient id="orbit-light" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#ffffff" /><Stop offset=".5" stopColor="#bbb0dc" stopOpacity={.45} /><Stop offset="1" stopColor="#ffffff" /></LinearGradient>
      </Defs>
      <Rect width="400" height="900" fill="url(#pearl-mist)" />
      <Ellipse cx="330" cy="42" rx="235" ry="56" rotation={-22} origin="330,42" fill="none" stroke="url(#orbit-light)" strokeWidth={2} />
      <Ellipse cx="330" cy="42" rx="239" ry="62" rotation={-22} origin="330,42" fill="none" stroke="#80639f" strokeOpacity={.8} strokeWidth={.7} />
      <Ellipse cx="12" cy="720" rx="245" ry="88" rotation={30} origin="12,720" fill="none" stroke="url(#orbit-light)" strokeWidth={1.5} />
      <Path d="M344 150q0-8 8-8-8 0-8-8 0 8-8 8 8 0 8 8M38 526q0-7 7-7-7 0-7-7 0 7-7 7 7 0 7 7" fill="#ad99c6" opacity={.65} />
    </Svg>
  </View>;
}

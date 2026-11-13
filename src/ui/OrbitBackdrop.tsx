import { StyleSheet, View } from "react-native";
import Svg, { Defs, Ellipse, LinearGradient, Path, RadialGradient, Rect, Stop } from "react-native-svg";
import { APP_COLORS } from "@/theme/tokens";

/** 02A's layered mist, translucent header ribbons and fine orbital glints. */
export function OrbitBackdrop() {
  return <View pointerEvents="none" accessible={false} accessibilityElementsHidden style={[StyleSheet.absoluteFill, { backgroundColor: APP_COLORS.canvas }]}>
    <Svg width="100%" height="100%" viewBox="0 0 400 900" preserveAspectRatio="xMidYMin slice">
      <Defs>
        <LinearGradient id="mist" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#fdfbff"/><Stop offset=".44" stopColor="#f8f5fb"/><Stop offset="1" stopColor="#f3eef8"/></LinearGradient>
        <RadialGradient id="glow" cx=".94" cy=".07" rx=".9" ry=".7"><Stop stopColor="#d7c9ea" stopOpacity=".42"/><Stop offset="1" stopColor="#fff" stopOpacity="0"/></RadialGradient>
        <LinearGradient id="ribbon" x1="0" y1="0" x2="1" y2=".6"><Stop stopColor="#d9cde9" stopOpacity=".48"/><Stop offset=".5" stopColor="#e9e1f2" stopOpacity=".35"/><Stop offset="1" stopColor="#cfc8e5" stopOpacity=".48"/></LinearGradient>
        <LinearGradient id="orbit" x1="0" y1="0" x2="1" y2="1"><Stop stopColor="#fff" stopOpacity="0"/><Stop offset=".48" stopColor="#ad96c8" stopOpacity=".42"/><Stop offset=".72" stopColor="#fff" stopOpacity=".9"/><Stop offset="1" stopColor="#c4b0d9" stopOpacity="0"/></LinearGradient>
      </Defs>
      <Rect width="400" height="900" fill="url(#mist)"/><Rect width="400" height="900" fill="url(#glow)"/>
      <Path d="M0 66 C102 24 177 116 400 58 L400 97 C225 124 142 55 0 105Z" fill="url(#ribbon)"/>
      <Path d="M0 76 C139 38 222 133 400 62" fill="none" stroke="#fff" strokeOpacity=".85" strokeWidth="1.2"/>
      <Path d="M0 90 C128 117 238 35 400 82 L400 100 C242 63 135 135 0 112Z" fill="#e5dced" opacity=".25"/>
      <Ellipse cx="225" cy="184" rx="286" ry="49" rotation={-24} origin="225,184" fill="none" stroke="url(#orbit)" strokeWidth=".7"/>
      <Ellipse cx="108" cy="716" rx="290" ry="80" rotation={29} origin="108,716" fill="none" stroke="url(#orbit)" strokeWidth=".8"/>
      <Path d="M27 597q0-5 5-5-5 0-5-5 0 5-5 5 5 0 5 5" fill="#b39bcc" opacity=".5"/>
    </Svg>
  </View>;
}

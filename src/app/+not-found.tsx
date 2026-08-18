import { Link } from "expo-router";
import type { JSX } from "react";
import { ImageBackground, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { APP_COLORS } from "@/theme/tokens";

export default function NotFoundScreen(): JSX.Element {
  return (
    <ImageBackground source={require("../../public/mobile-bg.webp")} resizeMode="cover" style={styles.background}>
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>404</Text>
          <Text style={styles.title}>這裡沒有排期</Text>
          <Text style={styles.body}>連結可能已經失效，或網址多了一個字。</Text>
          <Link href="/schedule" style={styles.link}>返回排期</Link>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: APP_COLORS.canvas },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(87,73,120,.3)" },
  safeArea: { flex: 1, padding: 20, justifyContent: "center" },
  card: { gap: 12, padding: 22, borderWidth: 1, borderColor: "rgba(255,255,255,.5)", borderRadius: 20, backgroundColor: "rgba(73,59,112,.75)" },
  eyebrow: { color: "#e4dff0", fontSize: 12, letterSpacing: 2 },
  title: { color: "white", fontSize: 24, fontWeight: "600" },
  body: { color: "#f2eff8", fontSize: 15, lineHeight: 24 },
  link: { color: "white", fontSize: 15, textDecorationLine: "underline" },
});

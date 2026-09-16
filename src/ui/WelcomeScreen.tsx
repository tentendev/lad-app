import { useEffect, useState } from "react";
import { ImageBackground, Modal, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Typography } from "heroui-native";
import { storage } from "@/data/repositories/storage";

export function WelcomeScreen() {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    void storage.get("welcome_v1", false).then(done => { if (active) setVisible(!done); }).catch(() => { if (active) setVisible(true); });
    return () => { active = false; };
  }, []);
  async function start() {
    setBusy(true);
    try { await storage.set("welcome_v1", true); setVisible(false); }
    catch { setError("介紹頁偏好未儲存。你仍可直接開始使用。下次啟動可能再次顯示。 "); }
    finally { setBusy(false); }
  }
  return <Modal visible={visible} animationType="fade" onRequestClose={() => setVisible(false)}>
    <ImageBackground source={require("../../assets/generated/ios-launch/onboarding.jpg")} resizeMode="cover" style={{ flex: 1, backgroundColor: "#34294e" }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end", padding: 24, paddingTop: 280 }}>
          <View style={{ maxWidth: 480, width: "100%", alignSelf: "center", gap: 20 }}>
            <View className="gap-3"><Typography accessibilityRole="header" className="text-4xl font-bold text-white">深空省省</Typography><Typography className="text-xl leading-8 text-white/85">把喜歡留在計畫裡，{"\n"}也替生活留點餘裕。</Typography></View>
            <View className="gap-3 rounded-2xl border border-white/20 bg-[#241b42]/80 p-4">
              <Typography className="text-base leading-6 text-white">01　看排期，提早準備資源</Typography>
              <Typography className="text-base leading-6 text-white">02　訂預算，記下每一筆花費</Typography>
              <Typography className="text-base leading-6 text-white">03　算禮包，追蹤自己的目標</Typography>
            </View>
            <Typography className="text-sm leading-6 text-white/70">主要功能免登入。紀錄先保存在這台裝置，雲端備份由你主動選擇。這是玩家自製的非官方規劃工具。</Typography>
            {error ? <Typography accessibilityRole="alert" className="text-sm text-[#ffd8df]">{error}</Typography> : null}
            <Button isDisabled={busy} onPress={() => void start()}>開始規劃</Button>
            {error ? <Button variant="ghost" onPress={() => setVisible(false)}>暫不儲存，直接使用</Button> : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  </Modal>;
}

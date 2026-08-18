import { Link } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import type { JSX } from "react";
import { useState } from "react";
import { Alert, Share, View } from "react-native";
import { Button, Card, Typography } from "heroui-native";

import { restoreLocalBackup } from "@/data/repositories/backupRestore";
import { readLocalBackupData } from "@/data/repositories/localBackupData";
import { storage } from "@/data/repositories/storage";
import { STORAGE_KEYS, STORAGE_PREFIX } from "@/data/repositories/storage.types";
import { createLocalBackup, parseLocalBackup } from "@/domain/backup";
import { NativePage } from "@/ui/NativePage";

export default function AboutScreen(): JSX.Element {
  const [backupStatus, setBackupStatus] = useState<{ tone: "ok" | "error"; message: string } | null>(null);
  const [backupBusy, setBackupBusy] = useState(false);

  async function shareJsonSource(source: string, filename: string, dialogTitle: string) {
    if (FileSystem.cacheDirectory && await Sharing.isAvailableAsync()) {
      const uri = `${FileSystem.cacheDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(uri, source, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(uri, { dialogTitle, mimeType: "application/json", UTI: "public.json" });
    } else {
      await Share.share({ message: source, title: filename });
    }
  }

  async function shareBackup() {
    setBackupBusy(true);
    try {
      const source = JSON.stringify(createLocalBackup(await readLocalBackupData(storage)), null, 2);
      const filename = `deep-space-ledger-backup-${new Date().toISOString().slice(0, 10)}.json`;
      await shareJsonSource(source, filename, "匯出深空省省備份");
      setBackupStatus({ tone: "ok", message: "備份已交給系統分享。請把 JSON 檔保存到安全的位置。" });
    } catch {
      setBackupStatus({ tone: "error", message: "備份無法建立或分享。現有資料沒有變更，請確認裝置仍有可用空間後再試一次。" });
    } finally {
      setBackupBusy(false);
    }
  }

  async function shareRecoveryCopy() {
    setBackupBusy(true);
    try {
      const keys = Object.values(STORAGE_KEYS);
      const stored = await AsyncStorage.multiGet(keys.map((key) => `${STORAGE_PREFIX}${key}`));
      const raw = Object.fromEntries(stored.map(([key, value]) => [key.slice(STORAGE_PREFIX.length), value]));
      const source = JSON.stringify({ product: "deep-space-ledger-recovery", exportedAt: new Date().toISOString(), raw }, null, 2);
      await shareJsonSource(source, `deep-space-ledger-recovery-${new Date().toISOString().slice(0, 10)}.json`, "匯出深空省省原始救援檔");
      setBackupStatus({ tone: "ok", message: "原始救援檔已交給系統分享。它用於保留損壞資料，不能直接還原。" });
    } catch {
      setBackupStatus({ tone: "error", message: "原始救援檔無法建立。請先不要清除 App 資料或移除 App。" });
    } finally {
      setBackupBusy(false);
    }
  }

  async function chooseBackup() {
    setBackupBusy(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset || (asset.size ?? 0) > 1_000_000) {
        setBackupStatus({ tone: "error", message: "備份檔超過 1 MB，為安全起見沒有讀取。" });
        return;
      }
      const restored = parseLocalBackup(await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.UTF8 }));
      Alert.alert(
        "還原本機備份？",
        "這會覆蓋目前的預算、花費、換算設定、抽卡規劃、五星紀錄與排期篩選。",
        [
          { text: "取消", style: "cancel", onPress: () => setBackupStatus({ tone: "ok", message: "已取消還原，現有資料沒有變更。" }) },
          {
            text: "確認還原",
            style: "destructive",
            onPress: () => {
              setBackupBusy(true);
              void restoreLocalBackup(storage, restored)
                .then(() => setBackupStatus({ tone: "ok", message: "備份已還原。重新開啟各頁即可確認資料。" }))
                .catch((error: unknown) => setBackupStatus({ tone: "error", message: error instanceof Error ? error.message : "備份還原失敗，原資料已保留。" }))
                .finally(() => setBackupBusy(false));
            },
          },
        ],
      );
    } catch (error) {
      setBackupStatus({ tone: "error", message: error instanceof Error ? error.message : "無法讀取這份備份檔。" });
    } finally {
      setBackupBusy(false);
    }
  }

  return (
    <NativePage
      eyebrow="About"
      title="關於深空省省"
      description="產品定位、資料來源與隱私說明。"
      showAboutLink={false}
    >
      <View className="items-start">
        <Link href="/schedule" className="rounded-xl border border-white/50 bg-white/10 px-3 py-2 text-sm text-white">← 返回排期</Link>
      </View>

      <Card className="gap-3 border border-white/50 bg-glass/70 p-5">
        <Typography className="text-xs uppercase tracking-[2px] text-white/60">About</Typography>
        <Typography.Heading className="text-2xl text-white">關於深空省省</Typography.Heading>
        <Typography.Paragraph className="leading-6 text-white/80">
          深空省省是玩家自製的抽卡課金規劃工具，支援《戀與深空》的排期整理、預算記錄與資源換算。本工具與遊戲開發商、發行商或營運商沒有隸屬、授權或合作關係。
        </Typography.Paragraph>
      </Card>

      <Card className="gap-3 border border-white/50 bg-glass/70 p-5">
        <Typography.Heading className="text-xl text-white">排期資訊</Typography.Heading>
        <Typography.Paragraph className="leading-6 text-white/80">
          已公告內容與預測排期會分開標示。預測資訊僅供規劃參考，實際卡池、活動與日期請以《戀與深空》官方公告為準。
        </Typography.Paragraph>
      </Card>

      <Card className="gap-3 border border-white/50 bg-glass/70 p-5">
        <Typography.Heading className="text-xl text-white">本機優先，也能自選雲端備份</Typography.Heading>
        <Typography.Paragraph className="leading-6 text-white/80">
          未登入時，預算、花費、換算設定、抽卡規劃、五星紀錄與排期篩選只儲存在裝置中。登入後可明確選擇上傳至自己的 Neon 雲端備份；系統不會在另一台裝置靜默覆寫。本工具不含廣告 SDK，也不做跨 App 追蹤。
        </Typography.Paragraph>
      </Card>

      <Card className="gap-3 border border-white/50 bg-glass/70 p-5">
        <Typography.Heading className="text-xl text-white">會員資料與刪除</Typography.Heading>
        <Typography.Paragraph className="leading-6 text-white/80">
          Google／Apple 登入由 Clerk 提供，會處理帳號識別、姓名與電子郵件。你可以在「會員中心」中管理個人資料、更新密碼、登出或永久刪除會員帳號與雲端備份；刪除帳號時，本機紀錄仍會保留。
        </Typography.Paragraph>
      </Card>

      <Card className="gap-3 border border-white/50 bg-glass/70 p-5">
        <Typography.Heading className="text-xl text-white">本機備份與還原</Typography.Heading>
        <Typography.Paragraph className="leading-6 text-white/80">
          JSON 備份包含預算、花費、換算設定、抽卡規劃、資源進度、五星紀錄與排期篩選，只在裝置上建立；還原前會再次確認並採交易式寫入。
        </Typography.Paragraph>
        <View className="gap-2">
          <Button isDisabled={backupBusy} onPress={() => void shareBackup()}>{backupBusy ? "處理中…" : "匯出 JSON 備份"}</Button>
          <Button variant="secondary" isDisabled={backupBusy} onPress={() => void chooseBackup()}>選擇 JSON 備份還原</Button>
          <Button variant="ghost" isDisabled={backupBusy} onPress={() => void shareRecoveryCopy()}>匯出原始救援檔</Button>
        </View>
        {backupStatus ? (
          <Typography accessibilityRole={backupStatus.tone === "error" ? "alert" : "text"} className={`text-sm leading-5 ${backupStatus.tone === "error" ? "text-[#ffc2cb]" : "text-[#bdf7e7]"}`}>
            {backupStatus.message}
          </Typography>
        ) : null}
      </Card>

      <Card className="gap-3 border border-white/50 bg-glass/70 p-5">
        <Typography.Heading className="text-xl text-white">政策與支援</Typography.Heading>
        <Link href="/privacy" className="text-sm text-white underline">閱讀完整隱私政策</Link>
        <Link href="/support" className="text-sm text-white underline">前往支援中心</Link>
      </Card>
    </NativePage>
  );
}

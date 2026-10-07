import { NativeLink as Link } from "@/ui/NativeLink";
import type { JSX } from "react";
import { Linking, View } from "react-native";
import { Button, Card, Typography } from "@/ui/NativeComponents";

import { PUBLIC_INFO } from "@/config/publicInfo";
import { NativePage } from "@/ui/NativePage";

export default function SupportScreen(): JSX.Element {
  return (
    <NativePage eyebrow="Support" title="支援中心" description="深空省省的使用說明與聯絡方式。" showAboutLink={false}>
      <View className="items-start"><Link href="/about" className="rounded-xl border border-white/50 bg-white/10 px-3 py-2 type-body text-white">← 返回關於</Link></View>
      <Card className="gap-3 border border-white/50 bg-glass p-5">
        <Typography className="type-label text-muted">Support</Typography>
        <Typography.Heading type="h4" className="type-headline text-white">需要協助嗎？</Typography.Heading>
        <Typography.Paragraph className=" text-muted">本服務由 {PUBLIC_INFO.operatorName} 營運。問題回報請附上裝置型號、iOS 版本、App 版本與重現步驟；請勿寄送密碼、驗證碼、完整備份檔或其他敏感資料。</Typography.Paragraph>
        {PUBLIC_INFO.supportEmail ? <Button variant="outline" onPress={() => void Linking.openURL(`mailto:${PUBLIC_INFO.supportEmail}?subject=${encodeURIComponent("深空省省支援")}`)}>寄信給支援團隊</Button> : <Typography className="type-body text-amber-100">正式支援信箱會在 App Store 上架前公布。</Typography>}
      </Card>
      <Card className="gap-3 border border-white/50 bg-glass p-5"><Typography.Heading type="h4" className="type-title text-white">本機資料與還原</Typography.Heading><Typography.Paragraph className=" text-muted">未登入資料只在這台裝置。刪除 App 或清除資料前，請先到「關於」匯出 JSON 備份；匯入會覆蓋目前資料，操作前請確認檔案來源。若一般備份因資料格式異常無法建立，請先匯出原始救援檔，並暫時不要清除資料。</Typography.Paragraph><Link href="/about" className="type-body text-white underline">前往本機備份</Link></Card>
      <Card className="gap-3 border border-white/50 bg-glass p-5"><Typography.Heading type="h4" className="type-title text-white">登入或驗證失敗</Typography.Heading><Typography.Paragraph className=" text-muted">先確認網路、Email 拼字與垃圾郵件匣。Apple 登入需完成服務商授權；請勿把驗證碼提供給任何人。</Typography.Paragraph><Link href="/account" className="type-body text-white underline">前往會員中心</Link></Card>
      <Card className="gap-3 border border-white/50 bg-glass p-5"><Typography.Heading type="h4" className="type-title text-white">雲端同步與版本衝突</Typography.Heading><Typography.Paragraph className=" text-muted">先在會員中心重新整理，再比較最後更新時間。系統只在你按下按鈕時上傳或下載，不會靜默覆寫另一台裝置的紀錄。</Typography.Paragraph></Card>
      <Card className="gap-3 border border-white/50 bg-glass p-5"><Typography.Heading type="h4" className="type-title text-white">刪除備份或帳號</Typography.Heading><Typography.Paragraph className=" text-muted">會員中心可只刪除 Neon 雲端備份，也可永久刪除 Clerk 會員與備份；兩者都保留本機資料。Apple 授權無法自動撤銷時，畫面會提供 iOS 設定路徑。</Typography.Paragraph><Link href="/privacy" className="type-body text-white underline">閱讀隱私政策</Link></Card>
      <Card className="gap-3 border border-white/50 bg-glass p-5"><Typography.Heading type="h4" className="type-title text-white">服務狀態與安全回報</Typography.Heading><Typography.Paragraph className=" text-muted">如持續無法登入或同步，請附上發生時間與畫面錯誤文字。發現疑似帳號遭使用或資料外洩時，請立即更改密碼、登出其他裝置並寄信通知支援團隊。</Typography.Paragraph></Card>
    </NativePage>
  );
}

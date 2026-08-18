import { Link } from "expo-router";
import type { JSX, ReactNode } from "react";
import { Linking, View } from "react-native";
import { Button, Card, Typography } from "heroui-native";

import { PUBLIC_INFO } from "@/config/publicInfo";
import { NativePage } from "@/ui/NativePage";

function PolicyCard({ title, children }: { title: string; children: ReactNode }): JSX.Element {
  return (
    <Card className="gap-3 border border-white/50 bg-glass/70 p-5">
      <Typography.Heading className="text-xl text-white">{title}</Typography.Heading>
      <Typography.Paragraph className="leading-6 text-white/80">{children}</Typography.Paragraph>
    </Card>
  );
}

export default function PrivacyScreen(): JSX.Element {
  return (
    <NativePage eyebrow="Privacy" title="隱私政策" description="深空省省如何保存、使用與刪除資料。" showAboutLink={false}>
      <View className="items-start">
        <Link href="/about" className="rounded-xl border border-white/50 bg-white/10 px-3 py-2 text-sm text-white">← 返回關於</Link>
      </View>

      <Card className="gap-3 border border-white/50 bg-glass/70 p-5">
        <Typography className="text-xs uppercase tracking-[2px] text-white/60">Privacy Policy</Typography>
        <Typography.Heading className="text-2xl text-white">隱私政策</Typography.Heading>
        <Typography.Paragraph className="leading-6 text-white/80">
          本政策說明 {PUBLIC_INFO.operatorName} 如何處理深空省省的資料。最後更新：{PUBLIC_INFO.privacyUpdatedAt}。
        </Typography.Paragraph>
      </Card>

      <PolicyCard title="適用範圍與營運者">本政策適用於深空省省 App、公開網站、會員功能、雲端備份與支援聯絡。資料控制與營運者為 {PUBLIC_INFO.operatorName}；正式上架前會以同一法律實體名稱更新 App Store 與本頁。</PolicyCard>
      <PolicyCard title="本機資料">未登入時，預算、花費、抽卡資源、備註、換算設定、抽卡規劃與五星紀錄只保存在你的裝置，不會自動上傳。移除 App、清除 App 資料或裝置故障可能使這些資料消失。</PolicyCard>
      <PolicyCard title="會員與登入資料">建立會員或使用 Google／Apple 登入時，Clerk 會代表我們處理姓名、電子郵件、使用者識別碼、登入憑證與驗證狀態。為提供登入及防止濫用，Clerk、Vercel 或其基礎設施也可能處理 IP、裝置／瀏覽器資訊與必要請求紀錄。</PolicyCard>
      <PolicyCard title="私人雲端備份">只有在你點選上傳時，預算、花費、抽卡資源、備註、換算設定、抽卡規劃與五星紀錄才會經 Vercel API 儲存到 Neon，並以 Clerk 使用者識別碼隔離。系統不會自動讀取其他 App、付款卡、銀行帳戶或遊戲帳號。</PolicyCard>
      <PolicyCard title="處理目的">資料只用於建立與保護會員、驗證登入、提供你主動選擇的私人備份／還原、處理版本衝突、回覆支援請求及履行適用的法律或安全義務。本 App 不含廣告 SDK、不出售個人資料，也不把資料用於跨 App 追蹤。</PolicyCard>

      <Card className="gap-3 border border-white/50 bg-glass/70 p-5">
        <Typography.Heading className="text-xl text-white">服務供應商</Typography.Heading>
        <Typography.Paragraph className="leading-6 text-white/80">資料可能由位於其他國家或地區的服務供應商處理，並受其安全措施與契約約束：</Typography.Paragraph>
        <Button variant="outline" onPress={() => void Linking.openURL("https://clerk.com/legal/privacy")}>Clerk 隱私政策</Button>
        <Button variant="outline" onPress={() => void Linking.openURL("https://vercel.com/legal/privacy-policy")}>Vercel 隱私政策</Button>
        <Button variant="outline" onPress={() => void Linking.openURL("https://neon.com/privacy-policy")}>Neon 隱私政策</Button>
      </Card>

      <PolicyCard title="保留與刪除">本機資料保留到你移除 App 或清除資料。雲端備份保留到你覆寫、單獨刪除備份或永久刪除帳號。會員中心可直接刪除 Neon 備份，或永久刪除 Neon 備份與 Clerk 帳號；刪除不需要聯絡客服，本機紀錄會保留。服務供應商仍可能依備援、安全或法定義務，在受限制的期間保留必要紀錄。</PolicyCard>
      <PolicyCard title="Apple 登入授權">使用 Apple 登入的會員刪除帳號時，系統會嘗試撤銷 Apple token。若 Apple 或 Clerk 未提供可撤銷的 token，帳號與雲端資料仍會先完成刪除，App 會指引你到 iOS「設定」的「使用 Apple 登入」頁面手動停止使用深空省省。</PolicyCard>
      <PolicyCard title="安全措施">會員 token 由 iOS 安全儲存機制保存；API 需驗證 Clerk token，雲端資料依使用者識別碼分隔，傳輸使用 HTTPS。沒有任何系統能保證絕對安全；如發現疑似未授權存取，請透過公開支援信箱通知我們。</PolicyCard>
      <PolicyCard title="你的選擇與權利">你可以不登入並使用所有主要功能，也能在會員中心查閱與修改會員資料、上傳／下載或刪除雲端備份、登出及永久刪除帳號。你也可以依適用法律要求存取、更正、刪除或限制處理；如無法在 App 內完成，請聯絡我們。</PolicyCard>
      <PolicyCard title="兒少、變更與通知">本服務不是專為 13 歲以下兒童設計，也不會故意向其收集會員資料。如得知不符規定的兒少資料，我們會採取刪除措施。政策如有重大變更，會更新本頁日期，必要時在 App 內提供通知。</PolicyCard>

      <Card className="gap-3 border border-white/50 bg-glass/70 p-5">
        <Typography.Heading className="text-xl text-white">聯絡我們</Typography.Heading>
        <Typography.Paragraph className="leading-6 text-white/80">
          {PUBLIC_INFO.supportEmail ? `隱私、資料權利或安全問題請寄到 ${PUBLIC_INFO.supportEmail}。` : "正式支援信箱會在 App Store 上架前公布；在填入前，production preflight 不會允許送審。"}
        </Typography.Paragraph>
        {PUBLIC_INFO.supportEmail ? (
          <Button variant="outline" onPress={() => void Linking.openURL(`mailto:${PUBLIC_INFO.supportEmail}`)}>寄送 Email</Button>
        ) : null}
        <Link href="/account" className="text-sm text-white underline">前往會員中心與資料控制</Link>
      </Card>
    </NativePage>
  );
}

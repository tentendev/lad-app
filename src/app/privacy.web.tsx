import type { JSX } from "react";

import { PUBLIC_INFO } from "@/config/publicInfo";
import { WebPage } from "@/ui/WebPage.web";

export default function PrivacyScreen(): JSX.Element {
  return (
    <div className="web-app standalone-page">
      <main className="web-main">
        <WebPage
          eyebrow="Privacy"
          title="隱私政策"
          description="深空省省如何保存、使用與刪除資料。"
          showAboutLink={false}
          action={<a className="back-link" href="/about"><span aria-hidden="true">‹</span>返回關於</a>}
        >
          <section className="product-card card trust-card">
            <p className="card-kicker">Privacy Policy</p>
            <h2 className="trust-title">隱私政策</h2>
            <p>本政策說明 {PUBLIC_INFO.operatorName} 如何處理深空省省的資料。最後更新：{PUBLIC_INFO.privacyUpdatedAt}。</p>
          </section>

          <section className="product-card card trust-card"><h2 className="trust-title">適用範圍與營運者</h2><p>本政策適用於深空省省 App、公開網站、會員功能、雲端備份與支援聯絡。資料控制與營運者為 {PUBLIC_INFO.operatorName}；正式上架前會以同一法律實體名稱更新 App Store 與本頁。</p></section>
          <section className="product-card card trust-card"><h2 className="trust-title">本機資料</h2><p>未登入時，預算、花費、抽卡資源、備註、換算設定、抽卡規劃與五星紀錄只保存在你的裝置，不會自動上傳。移除 App、清除網站資料或裝置故障可能使這些資料消失。</p></section>
          <section className="product-card card trust-card"><h2 className="trust-title">會員與登入資料</h2><p>建立會員或使用 Google／Apple 登入時，Clerk 會代表我們處理姓名、電子郵件、使用者識別碼、登入憑證與驗證狀態。為提供登入及防止濫用，Clerk、Vercel 或其基礎設施也可能處理 IP、裝置／瀏覽器資訊與必要請求紀錄。</p></section>
          <section className="product-card card trust-card"><h2 className="trust-title">私人雲端備份</h2><p>只有在你點選上傳時，預算、花費、抽卡資源、備註、換算設定、抽卡規劃與五星紀錄才會經 Vercel API 儲存到 Neon，並以 Clerk 使用者識別碼隔離。系統不會自動讀取其他 App、付款卡、銀行帳戶或遊戲帳號。</p></section>
          <section className="product-card card trust-card"><h2 className="trust-title">處理目的</h2><p>資料只用於建立與保護會員、驗證登入、提供你主動選擇的私人備份／還原、處理版本衝突、回覆支援請求及履行適用的法律或安全義務。本 App 不含廣告 SDK、不出售個人資料，也不把資料用於跨 App 追蹤。</p></section>
          <section className="product-card card trust-card">
            <h2 className="trust-title">服務供應商與跨境處理</h2>
            <p>資料可能由位於其他國家或地區的服務供應商處理，並受其安全措施與契約約束。</p>
            <div className="backup-actions"><a className="backup-button" href="https://clerk.com/legal/privacy" target="_blank" rel="noreferrer">Clerk 隱私政策</a><a className="backup-button" href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer">Vercel 隱私政策</a><a className="backup-button" href="https://neon.com/privacy-policy" target="_blank" rel="noreferrer">Neon 隱私政策</a></div>
          </section>
          <section className="product-card card trust-card"><h2 className="trust-title">保留與刪除</h2><p>本機資料保留到你移除 App 或清除資料。雲端備份保留到你覆寫、單獨刪除備份或永久刪除帳號。會員中心可直接刪除 Neon 備份，或永久刪除 Neon 備份與 Clerk 帳號；刪除不需要聯絡客服，本機紀錄會保留。服務供應商仍可能依備援、安全或法定義務，在受限制的期間保留必要紀錄。</p></section>
          <section className="product-card card trust-card"><h2 className="trust-title">Apple 登入授權</h2><p>使用 Apple 登入的會員刪除帳號時，系統會嘗試撤銷 Apple token。若 Apple 或 Clerk 未提供可撤銷的 token，帳號與雲端資料仍會先完成刪除，畫面會指引你到 Apple ID 的「使用 Apple 登入」設定手動停止使用深空省省。</p></section>
          <section className="product-card card trust-card"><h2 className="trust-title">安全措施</h2><p>會員 token 由受保護的儲存機制保存；API 需驗證 Clerk token，雲端資料依使用者識別碼分隔，傳輸使用 HTTPS。沒有任何系統能保證絕對安全；如發現疑似未授權存取，請透過公開支援信箱通知我們。</p></section>
          <section className="product-card card trust-card"><h2 className="trust-title">你的選擇與權利</h2><p>你可以不登入並使用所有主要功能，也能在會員中心查閱與修改會員資料、上傳／下載或刪除雲端備份、登出及永久刪除帳號。你也可以依適用法律要求存取、更正、刪除或限制處理；如無法在 App 內完成，請聯絡我們。</p></section>
          <section className="product-card card trust-card"><h2 className="trust-title">兒少、變更與通知</h2><p>本服務不是專為 13 歲以下兒童設計，也不會故意向其收集會員資料。如得知不符規定的兒少資料，我們會採取刪除措施。政策如有重大變更，會更新本頁日期，必要時在 App 內提供通知。</p></section>

          <section className="product-card card trust-card">
            <h2 className="trust-title">聯絡我們</h2>
            {PUBLIC_INFO.supportEmail ? <p>隱私、資料權利或安全問題請寄到 <a href={`mailto:${PUBLIC_INFO.supportEmail}`}>{PUBLIC_INFO.supportEmail}</a>。</p> : <p>正式支援信箱會在 App Store 上架前公布；在填入前，production preflight 不會允許送審。</p>}
            <div className="backup-actions"><a className="backup-button" href="/account">會員中心與資料控制</a><a className="backup-button" href="/support">支援中心</a></div>
          </section>
        </WebPage>
      </main>
    </div>
  );
}

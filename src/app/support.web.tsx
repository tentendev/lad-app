import type { JSX } from "react";

import { PUBLIC_INFO } from "@/config/publicInfo";
import { WebPage } from "@/ui/WebPage.web";

export default function SupportScreen(): JSX.Element {
  return (
    <div className="web-app standalone-page">
      <main className="web-main">
        <WebPage
          eyebrow="Support"
          title="支援中心"
          description="深空省省的使用說明與聯絡方式。"
          showAboutLink={false}
          action={<a className="back-link" href="/about"><span aria-hidden="true">‹</span>返回關於</a>}
        >
          <section className="product-card card trust-card">
            <p className="card-kicker">Support</p><h2 className="trust-title">需要協助嗎？</h2>
            <p>本服務由 {PUBLIC_INFO.operatorName} 營運。問題回報請附上裝置型號、iOS 版本、App 版本與重現步驟；請勿寄送密碼、驗證碼、完整備份檔或其他敏感資料。</p>
            {PUBLIC_INFO.supportEmail ? <div className="backup-actions"><a className="backup-button" href={`mailto:${PUBLIC_INFO.supportEmail}?subject=${encodeURIComponent("深空省省支援")}`}>寄信給支援團隊</a></div> : <p>正式支援信箱會在 App Store 上架前公布。</p>}
          </section>
          <section className="product-card card trust-card"><h2 className="trust-title">本機資料與還原</h2><p>未登入資料只在這台裝置。刪除 App 或清除網站資料前，請先到「關於」匯出 JSON 備份；匯入會覆蓋目前資料，操作前請確認檔案來源。若一般備份因資料格式異常無法建立，請先匯出原始救援檔，並暫時不要清除資料。</p><div className="backup-actions"><a className="backup-button" href="/about">前往本機備份</a></div></section>
          <section className="product-card card trust-card"><h2 className="trust-title">登入或驗證失敗</h2><p>先確認網路、Email 拼字與垃圾郵件匣。Google／Apple 登入需完成服務商授權；請勿把驗證碼提供給任何人。</p><div className="backup-actions"><a className="backup-button" href="/account">前往會員中心</a></div></section>
          <section className="product-card card trust-card"><h2 className="trust-title">雲端同步與版本衝突</h2><p>先在會員中心重新整理，再比較最後更新時間。系統只在你按下按鈕時上傳或下載，不會靜默覆寫另一台裝置的紀錄。</p></section>
          <section className="product-card card trust-card"><h2 className="trust-title">刪除備份或帳號</h2><p>會員中心可只刪除 Neon 雲端備份，也可永久刪除 Clerk 會員與備份；兩者都保留本機資料。Apple 授權無法自動撤銷時，畫面會提供 Apple ID 設定路徑。</p><div className="backup-actions"><a className="backup-button" href="/privacy">閱讀隱私政策</a></div></section>
          <section className="product-card card trust-card"><h2 className="trust-title">服務狀態與安全回報</h2><p>如持續無法登入或同步，請附上發生時間與畫面錯誤文字。發現疑似帳號遭使用或資料外洩時，請立即更改密碼、登出其他裝置並寄信通知支援團隊。</p></section>
        </WebPage>
      </main>
    </div>
  );
}

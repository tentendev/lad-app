# App Store Connect 填寫與 Review 套件

版本：1.0.0  
語系：繁體中文  
Bundle ID：`com.tenten.deepspaceledger`

## Product Page

- 名稱：深空省省
- 副標題：抽卡排期與預算規劃
- Primary Category：Utilities
- Secondary Category：Finance
- Support URL：`https://lad-pocket.vercel.app/support`
- Privacy Policy URL：`https://lad-pocket.vercel.app/privacy`
- Privacy Choices URL：`https://lad-pocket.vercel.app/account`
- Marketing URL：可留空，或日後使用公開首頁
- 版本描述與 keywords：以 `store.config.json` 為單一草稿來源
- Copyright：等待法律實體／版權名稱

送審前確認名稱、副標題、關鍵字、截圖與描述沒有把第三方商標當成未經授權的搜尋字或誤導為官方產品。

## Review Notes（可直接貼，最後再補版本）

> 深空省省的排期、錢包與換算主要功能不需要登入。開啟 App 後可直接使用。  
> 會員入口位於各主要頁面右上方「登入／註冊」，頁面底部也有「會員中心」連結。登入後才會顯示使用者主動操作的私人雲端備份。App 不會自動上傳或跨裝置覆寫資料。  
> Google 與 Sign in with Apple 均由 Clerk 提供。會員中心可編輯姓名、更新密碼（Email/password 帳號）、登出、只刪除雲端備份，或永久刪除會員帳號與雲端備份。永久刪除位於會員中心底部「帳號管理」，不需要聯絡客服。  
> Privacy Policy、Support 與 Privacy Choices 均可在 App 內頁尾開啟，並有相同的公開 HTTPS 網址。  
> 本版本免費，沒有廣告、App Tracking Transparency、App 內購買或訂閱。

## Review 登入資訊

核心功能不需登入，但 reviewer 若需測會員／雲端功能，必須在 App Store Connect「App Review Information」提供一組專用、已驗證、可重設的 production demo 帳號。

- Demo account Email：只填 App Store Connect，不要 commit
- Demo account password：只填 App Store Connect，不要 commit
- 若 Clerk 啟用 Client Trust／MFA：review 帳號需避免 reviewer 無法取得驗證碼；或在 Review Notes 提供可行且安全的操作說明
- 不要提供個人 Google／Apple 帳號
- 送審前實測 demo 帳號：登入、下載／上傳、登出、再次登入與帳號刪除

## App Privacy

逐項照 `docs/PRIVACY_DATA_INVENTORY.md` 填寫；包括所有第三方 SDK 與 production 後端的實際做法。Data Used to Track You 全部為 No。

## 截圖與測試素材

- 6.9 吋 iPhone portrait：至少 3 張，建議順序為排期、錢包預算、資源換算、會員／雲端資料控制。
- 因 `supportsTablet=true`，另需 13 吋 iPad portrait 截圖與完整 iPad UI 驗收。
- 截圖必須來自實際 App UI，不要只放 splash／登入頁，不要出現 Android 或瀏覽器 chrome。
- 第一版可不提供 App Preview video。

## App Review Contact

- First / Last Name：待提供
- Phone：待提供，必須能在審核時段接聽
- Email：待提供
- Notes：使用上方內容

## 最後的人工作業

- Age Rating 問卷
- Content Rights
- EU DSA trader status
- Export Compliance
- Availability／territories
- Pricing（目前 Free）
- App Store release 設為 Manual
- 選擇 production build
- 確認 App Privacy 與 Privacy Nutrition Label


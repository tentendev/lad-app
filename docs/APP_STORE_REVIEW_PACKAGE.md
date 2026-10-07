# App Store Connect 填寫與 Review 套件

版本：1.0.0  
語系：繁體中文  
Bundle ID：`com.tenten.deepspaceledger`

## Product Page

- 名稱：深空省省
- 副標題：抽卡排期與預算規劃
- Primary Category：Utilities
- Secondary Category：Finance
- Support URL：`https://deep-space-ledger-support.vercel.app/support`
- Privacy Policy URL：`https://deep-space-ledger-support.vercel.app/privacy`
- Privacy Choices URL：`https://deep-space-ledger-support.vercel.app/account`
- Marketing URL：可留空，或日後使用公開首頁
- 版本描述與 keywords：以 `store.config.json` 為單一草稿來源
- Copyright：`2026 Maggie`（原創者姓名依本次需求；不代表第三方遊戲內容已授權）

送審前確認名稱、副標題、關鍵字、截圖與描述沒有把第三方商標當成未經授權的搜尋字或誤導為官方產品。

## 正式環境驗證完成後的 Review Notes 範本

以下內容必須先逐項實測再使用。本次 App Store Connect 保存的是如實說明正式登入／後端尚未完成驗證的 notes，沒有宣稱下列登入與刪除流程已通過 production 驗收。

> 深空省省的排期、錢包與換算主要功能不需要登入。開啟 App 後可直接使用。  
> 會員入口位於各主要頁面右上方「登入／註冊」，頁面底部也有「會員中心」連結。登入後才會顯示使用者主動操作的私人雲端備份。App 不會自動上傳或跨裝置覆寫資料。  
> Email／密碼與 Sign in with Apple 由 Clerk 提供。會員中心可編輯姓名、更新密碼（Email/password 帳號）、登出、只刪除雲端備份，或永久刪除會員帳號與雲端備份。永久刪除位於會員中心底部「帳號管理」，不需要聯絡客服。
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

- First / Last Name：Kuan Yu / Chen（Apple Individual 帳號）
- Phone：已依 Apple Developer Membership 聯絡資料填入 App Store Connect，不在 Repo 公開個人電話
- Email：`dev@tenten.co`
- Notes：完成正式環境驗收後使用上方範本；測試版本必須如實說明限制

## 正式送審前仍需確認的項目

- Content Rights 已於 2026-10-07 依擁有者確認與素材盤點完成；送審素材若變更，需重新檢查
- EU DSA 已依擁有者確認填為非商業經營者
- 正式登入／後端、demo 帳號及資料刪除實測
- 選擇通過正式環境驗收的 production build


## 2026-10-03 實際狀態

商店介紹、副標題、關鍵字、Utilities / Finance 分類、Manual release、版權與 review contact 已存入 App Store Connect。公開支援／隱私／資料刪除站台為獨立 Vercel project `deep-space-ledger-support`，不會覆蓋 Maggie 的 HTML prototype。Age rating 依 App 實際功能填寫，並依既有兒少政策提高為 13+。

價格已設定 Free（各地區價格皆為 0），availability 設定所有 175 個國家／地區於正式發布後可下載。已上傳 3 張實際 iPhone 6.9 吋截圖（排期、錢包、換算）及 1 張 iPad 13 吋排期截圖；Apple 自動產生 iPhone 6.5 吋素材。App Privacy 的 8 項資料申報已 Publish，沒有 Data Used to Track You。

正式 App Review 尚未送出。新的 Clerk production instance 已建立，但 domain proxy 尚未驗證；production Google / Apple、正式後端及測試帳號尚未完成。Content Rights 尚未勾選，因目前沒有第三方內容使用權的證據。不要把本次 TestFlight 上傳當成正式 App Store 送審，也不要把上述 Review Notes 範本當作已完成的實測聲明。

TestFlight 1.0.0 (4) 已由 Apple 處理為 `VALID`，外部狀態 `IN_BETA_TESTING`，已加入既有 Core QA 與 Maggie & Erik UI Testing 群組。What to Test 明確說明此次同步項目、Clerk 測試環境及正式服務尚未驗收。完整發布證據見 [發布紀錄](../artifacts/2026-10-03-expo-sync/RELEASE.md)。

## 2026-10-07 後續進度

已建立獨立正式 Web／API、全新 Neon 資料庫與 Clerk native app，並修正及驗證同步 API 的 Node 啟動錯誤。正式 DNS、Email、SSL 與自訂 Web 網域已完成；Apple connection 已設定，首版依使用者指示移除 Google 登入，Email 登入、備份上傳／下載、衝突處理、登出／再次登入、只刪雲端與永久帳號刪除已通過正式驗收；Apple native 登入與撤銷仍待實機驗收。

使用者確認未使用角色／活動素材；核對正式版素材後，App Store Connect Content Rights 已存為未使用第三方內容，見 [素材盤點](APP_ASSET_REVIEW.md)。Free Apps Agreement 為 Active，DSA 已依擁有者確認填為非商業經營者，Apple 顯示已完成。Apple version 1.0.0 仍為 `PREPARE_FOR_SUBMISSION`，build 尚未選定，review demo credentials 尚空白。詳細已完成項目與阻擋見 [送審狀態](APP_STORE_SUBMISSION_STATUS.md)。

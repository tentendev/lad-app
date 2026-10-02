# 2026-10-03 發布紀錄

Maggie 的最新 HTML Prototype 已同步至 Expo，並推送 GitHub。新版 iOS **1.0.0 (4)** 已成功上傳 Apple、完成處理並開放 TestFlight 測試。**正式 App Store App Review 尚未提交，也尚未上架。**

## 來源與 App

- Maggie upstream：[`521e7be`](https://github.com/its-maggie/lad-app/commit/521e7be4d1c9f6fca1b67077f23dc61c08a80657)，最後再次查詢 upstream HEAD 仍為此提交。
- Expo 實作：[`93ebcbd`](https://github.com/tentendev/lad-app/commit/93ebcbddddb7c1928f120a54cbf82952d4c0b77c)，已推送 main。
- 新版包括最新唯一公告、10/2 排期資料、周邊綠色、暫定活動結束狀態及目標前可用返券的換算修正。
- [EAS iOS build](https://expo.dev/accounts/tentenco/projects/deep-space-ledger/builds/edba79ee-be28-4577-b2b3-72a4f4680f46)：`testflight-ui` profile、preview 環境、1.0.0 (4)。
- [Apple TestFlight build](https://appstoreconnect.apple.com/teams/2e9d3fb9-37c3-4806-b555-5c8a450ab9b4/apps/6812909987/testflight/ios/1ca9fdb8-6ee3-4cf1-b053-43e927bfc329)：`VALID` / `READY_FOR_BETA_TESTING` / `IN_BETA_TESTING`。
- 已加入既有 Core QA 與 Maggie & Erik UI Testing 群組；外部群組原有 2 位測試者，沒有新增邀請。What to Test 已保存本次驗收項目及正式服務限制。
- [驗收與截圖說明](QA.md)：128 個自動測試、Doctor 21/21、Web / Hermes bundle、完整 iPhone / iPad Simulator build 主流程通過。

## Apple 上傳

EAS submission `349c252d-7897-47c1-bc9e-d9f3299a427c` 長時間停留在 IN_QUEUE。Apple 官方 `altool 26.40.1` 驗證 IPA 沒有錯誤後，先取消該 EAS 佇列並確認 `CANCELED`，再直接上傳 Apple，避免重複傳送。

直接上傳成功、沒有錯誤；Delivery UUID / Apple build ID：`1ca9fdb8-6ee3-4cf1-b053-43e927bfc329`。Apple uploaded date：2026-10-03 02:09:09（Asia/Taipei）。簽章與 provisioning profile 驗證通過，IPA SHA-256：

`ba8973ad16d7c52713d925aea4f07bc71fbb69dbe303605ac598e052fc8eed3b`

[機器可讀 build / release receipt](build-receipt.json) 保留來源、build 與最終 TestFlight 狀態；未包含憑證、私鑰或有時效的簽署下載網址。

## 已完成的商店準備

- 繁體中文介紹、關鍵字、副標題、Utilities / Finance 分類、Copyright、實際 Apple 帳號 Review contact 與 Manual release 已保存。
- 價格 Free；availability 設為全部 175 個國家／地區於正式發布後提供。
- Age rating 13+；App Privacy 8 種資料全數 App Functionality、Linked to You、No Tracking，已 Publish。
- 上傳實際 iPhone 6.9 吋截圖 3 張及 iPad 13 吋截圖 1 張；Apple 自動產生 iPhone 6.5 吋素材。[原始圖片尺寸與 SHA-256](store-screenshot-receipt.json)。
- 獨立 [支援站台](https://deep-space-ledger-support.vercel.app/support)、[隱私政策](https://deep-space-ledger-support.vercel.app/privacy) 與 [帳號刪除說明](https://deep-space-ledger-support.vercel.app/account) 已公開，HTTP 200。站台營運者採 Apple Individual 帳號的 Kuan Yu Chen，支援信箱 dev@tenten.co。
- 已將上述公開營運者與支援 Email 加入 EAS production / preview 環境，供未來 build 使用。現有 build 4 不會因此改變。
- `lad-pocket.vercel.app` 保留 Maggie HTML prototype；未以 Expo export 覆蓋。

## 正式 App Review 未完成的條件

[實際 preflight](app-review-preflight.txt) 仍有 16 項阻擋，主要為：

1. Clerk production instance 雖已建立，但 domain proxy、native application、正式 Google / Apple 登入與端到端實測尚未完成；目前 build 4 使用 preview / test instance。
2. 正式 API、Clerk / Neon credentials 輪替及 Apple token 撤銷設定尚未完成。現有 prototype 網域的 `/api/sync` 與 `/api/account` 回 404，未達 401 / 405 邊界要求。
3. 沒有取得第三方遊戲、角色及活動內容的使用權證據，因此未代填 Apple 的 Content Rights 權利聲明。
4. 正式服務的 reviewer demo account、EU DSA trader status 仍需依實際環境／營運狀態完成。

App Store 版本仍為 Prepare for Submission。沒有把 preview build 選作已驗收的 production 版本，也沒有把上述 release attestation 預先填 true。下一次正式送審必須使用通過這些條件的新 production build；本次 TestFlight 發布不能當作正式 App Store 送審完成。

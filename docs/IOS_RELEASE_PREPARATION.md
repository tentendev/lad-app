# iOS 上架準備（2026-08-14）

## 目前結論

專案已能產生 iOS JavaScript／Hermes bundle，但還不能建立可送 TestFlight 的簽名 `.ipa`。目前缺少 Apple／Expo 帳號連結、App Store Connect app record、Clerk production instance、Apple 登入與公開 Production 後端。

本機已安裝 Xcode 26.6，符合 Apple 自 2026-04-28 起要求使用 iOS 26 SDK 或更新版本上傳的條件。EAS 三個 iOS profile 已固定使用 `sdk-57` image；Expo SDK 57 的 Xcode 基準為 26.4 或更新版本。

## 已完成

- Expo SDK 57、Expo Router、HeroUI Native／Uniwind 與 iOS bundle identifier。
- 1024 × 1024 App icon、啟動畫面、portrait 與 dark appearance。
- EAS Simulator、內部 Preview、App Store Production profiles；Production 自動遞增 build number。
- Clerk Email／密碼、Google SSO、原生 Sign in with Apple、SecureStore session、會員中心、登出、單獨刪除雲端備份與 App 內永久帳號刪除。
- Apple 會員刪除時的 server-side token revoke；無可用 token 時仍完成刪除並提供手動撤銷路徑。
- 隱私 manifest：姓名、Email、user ID、device ID、其他診斷資料、客服資料、其他財務資訊與其他使用者內容；不追蹤。
- `/privacy`、`/support`、`/account` 公開頁面原始碼與繁體中文 App Store metadata 草稿。
- `npm run preflight:ios-build` 檢查基礎封裝設定；`npm run preflight:ios-submit` 檢查正式帳號、metadata 與公開端點，不會開始付費 build 或提交。

## 擁有者需要準備

1. 有效的 Apple Developer Program 會員。只需提供會員狀態、Team ID 與 App Store Connect 權限；不要在對話中提供 Apple 密碼、雙重驗證碼或 `.p8` 私鑰內容。
2. Expo 帳號／組織名稱。之後由擁有者在這台 Mac 直接執行 `npx eas-cli@latest login`，再以 `eas init` 連結 project。
3. 核准 bundle identifier `com.tenten.deepspaceledger`。第一次建立 App ID／簽名 build 後不應再更換。
4. 在 App Store Connect 建立 iOS app record：名稱「深空省省」、主要語言繁體中文、核准的 Bundle ID、自訂 SKU。建立後提供頁面上的數字 Apple ID（`ascAppId`）。
5. 決定是否支援 iPad。目前為 `supportsTablet=true`；保留時需要 13 吋 iPad 截圖及 iPad 驗收。不需要 iPad 時，應在第一個 build 前改為 `false`。
6. 正式公開的營運者／法律實體名稱、支援 Email 與版權名稱。這些會出現在隱私政策、支援頁與 App Store Connect。
7. 確認對第三方遊戲名稱、角色名、活動排期、商標及其他內容有足夠使用權。免責聲明不能取代授權；Apple 可能要求提出證明。
8. 決定是否允許把已驗證的新版升到 `https://lad-pocket.vercel.app` Production。現在公開 Production 的 `/privacy`、`/support`、`/account` 與 `/api/sync` 都是 404，受 SSO 保護的 Preview 不能用作 App Store 公開支援網址或正式 App 後端。

## 正式服務設定

### Clerk

- 建立 Clerk production instance 與正式網域，不能沿用 `pk_test_` development instance。
- 在 Clerk Native applications 登記 Apple Team ID 與 `com.tenten.deepspaceledger`。
- 使用自有 Google OAuth credentials，確認 iOS callback 與 `deep-space-ledger://sso-callback` allowlist。
- 啟用 Apple connection 與 Hide My Email；Production EAS environment 設定 `EXPO_PUBLIC_ENABLE_APPLE_SIGN_IN=true`。
- Production EAS environment 只放可公開的 `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`。`CLERK_SECRET_KEY` 與 `DATABASE_URL` 只留在 Vercel server environment，不可打包進 App。

先前曾出現在對話中的 Clerk secret 與 Neon database credential 應在正式上線前輪替；輪替後只存於密碼管理器及 Vercel sensitive／secret environment，不要再貼到對話或 commit。

### 公開服務與隱私

- Production 必須公開回傳：`/privacy` 200、`/support` 200、`/account` 200、未帶 token 的 `/api/sync` 401、`DELETE /api/account` 401、`GET /api/account` 405。
- `EXPO_PUBLIC_LEGAL_ENTITY_NAME`、`EXPO_PUBLIC_SUPPORT_EMAIL` 與 `EXPO_PUBLIC_SYNC_API_URL` 必須設定在 Web build 與 EAS Production environment。
- App Store Privacy 以 `docs/PRIVACY_DATA_INVENTORY.md` 為準，包含第三方驗證服務可能保留的安全資料；全部 not used for tracking。
- App 可不登入使用主要功能；使用者可在 App 內單獨刪除雲端備份或永久刪除帳號。
- 正式環境與密鑰清單見 `docs/PRODUCTION_ENVIRONMENT.md`；App Review 填寫稿見 `docs/APP_STORE_REVIEW_PACKAGE.md`。
- 上線後的支援、資料權利、安全事件、備份與 rollback 流程見 `docs/OPERATIONS_RUNBOOK.md`。

## 封裝與送審順序

1. 完成上方擁有者資料，連結 Expo project 與 Apple Team。
2. 公開部署 Production，完成 Clerk production、Google／Apple 登入與 Neon API smoke test。
3. 安裝 iOS Simulator runtime，執行 iPhone 大／小尺寸及必要的 iPad UI 驗收。
4. 執行 `npm run check`、`npm run doctor`、`npm run verify:ios-bundle`、`npm run preflight:ios-build`、`npm run preflight:ios-submit`。
5. 建立內部簽名 build：`npx eas-cli@latest build --platform ios --profile preview`，並在實機測 Google／Apple 登入、重啟 session、同步衝突與帳號刪除。
6. 建立 App Store build：`npx eas-cli@latest build --platform ios --profile production`。
7. 以 EAS Submit 上傳 TestFlight：`npx eas-cli@latest submit --platform ios --profile production`。上傳不等於送審；完成 TestFlight 驗收後才在 App Store Connect 選擇 build 並送 App Review。
8. 準備 1–10 張 6.9 吋 iPhone 截圖；若保留 iPad，另需 13 吋 iPad 截圖。完成描述、關鍵字、年齡分級、App Privacy、review contact、審核備註及必要的登入測試方式。

不要先使用 `--auto-submit`。第一版應把 build、TestFlight 上傳與 App Review 送審拆開，以便逐關驗收。

# 會員與雲端架構決策

## 決策

- Clerk：Email／密碼會員、Email 驗證碼、Apple OAuth、session、SecureStore token 與帳號刪除。
- Neon：每位 Clerk user 的私人資料 snapshot；資料庫連線只存在 Vercel Node function。
- Expo Router：Web、iOS、Android 共用登入流程與 account model；Web 使用 HeroUI React，原生使用 HeroUI Native。

Neon 不是 authentication provider，因此不拿它取代 Clerk。未登入使用者仍可完整使用本機功能。

## 同步語意

`lad_cloud_snapshots` 以 Clerk `user_id` 為 primary key，保存 validated backup JSON、revision 與更新時間。上傳必須帶目前 `expectedRevision`；版本落後時回 409，不做 silent last-write-wins。下載資料前 UI 會再次確認，還原仍沿用交易式 local rollback。

會員中心提供兩種明確控制：

- 只刪除雲端備份：刪除 Neon snapshot，保留 Clerk user 與本機資料。
- 永久刪除會員：受驗證的 `DELETE /api/account` 先刪 Neon snapshot；Apple 會員會以 Apple REST API 嘗試撤銷 token，接著刪 Clerk user。本機資料不自動刪除。若 Clerk 無法提供 Apple token，會員與 snapshot 仍會完成刪除，UI 會引導使用者到 Apple ID 設定手動撤銷。

## 安全邊界

- `CLERK_SECRET_KEY` 與 `DATABASE_URL` 只存 gitignored local env 與 Vercel sensitive Preview／Production env。
- client bundle 只能包含 `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`；release scan 會拒絕 secret key、Postgres URL 或 Neon password pattern。
- API 驗證 Clerk JWT 簽章；Web token 若有 `azp`，還要符合 production、當前 Vercel preview 或明確 allowlist。
- API body 上限 1 MB、資料使用共用 schema 驗證、response `private, no-store`，Neon query 全部參數化。
- 帳號刪除只接受 `DELETE` 且需要有效 Clerk bearer token；Apple private key 只存在 Vercel Production。

## OAuth 與發佈

Email／密碼 custom flow 使用 Clerk Core 3 `useSignUp()`／`useSignIn()` API。註冊要求至少 15 碼密碼，接著以 Email 6 位數驗證碼完成；登入支援 Clerk Client Trust 的新裝置 Email 驗證，另提供重寄驗證碼與忘記密碼流程。Web 註冊表單保留 `clerk-captcha` Smart CAPTCHA 掛載點；Expo iOS／Android 依 Clerk Native API 規則跳過瀏覽器 CAPTCHA。

Google 與 Web Apple SSO 使用 Clerk Expo `useSSO()` 與 `expo-auth-session`，callback 為 `/sso-callback` 或 `deep-space-ledger://sso-callback`。iOS Apple 登入使用 `@clerk/expo/apple` 與 `expo-apple-authentication` 原生 flow，App config 已宣告 Sign in with Apple entitlement。Clerk redirect allowlist 仍需在 production instance 以正式 Team ID／Bundle ID 驗證。

Google connection 已以真實瀏覽器驗證可進入 Google Accounts。Apple 原生 flow 與刪除時撤銷流程已實作，但目前 Clerk development instance 尚未啟用 Apple；UI 預設隱藏。取得 Apple Developer／Clerk Apple connection 憑證後，在 EAS 與 Web build 設定 `EXPO_PUBLIC_ENABLE_APPLE_SIGN_IN=true` 才會顯示。iOS 正式上架若保留 Google 登入，必須在送審前完成原生實機登入、重新登入、刪除與撤銷驗收。Production 應改用 Clerk production instance 與自有 Apple OAuth credentials，不能沿用 development key。

EAS build 必須在對應 environment 提供 `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`。原生同步預設指向 `https://deep-space-ledger-app.vercel.app/api/sync`，也可用 `EXPO_PUBLIC_SYNC_API_URL` 覆寫。

## 2026-10-07 正式環境準備

獨立 Vercel project `deep-space-ledger-app` 已部署正式 Clerk key 與全新 Neon 專案憑證。共用 domain 模組改用 Node 與 Metro 都能解析的相對匯入，並在 prebuilt 驗證中實際載入兩個 API handler，防止僅通過 TypeScript 卻在 Vercel 啟動時失敗。線上未登入／無效 token 邊界已通過。Clerk 自訂網域 DNS、production Apple OAuth 與登入後同步／永久刪除驗收仍待完成。

`scripts/smoke-cloud-sync.mjs` 透過 Clerk Backend API 建立開發 session；Clerk production 禁止該操作，不能以這支腳本聲稱 production 已驗收。正式驗收必須使用真實登入流程與專用測試帳號。本次嘗試產生的臨時使用者已清理，正式 Clerk users 與 Neon snapshots 均為 0。

# Production 環境與密鑰清單

## 必須先輪替

2026-08-14 前曾透過非 secret channel 分享的 Clerk secret 與 Neon connection string，視為已暴露。正式部署前要在 Clerk／Neon 產生新值並撤銷舊值；新值只能放在密碼管理器與平台的 encrypted/sensitive environment。

## EAS Production（會進 client bundle 的公開值）

- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...`
- `EXPO_PUBLIC_ENABLE_APPLE_SIGN_IN=true`
- `EXPO_PUBLIC_SYNC_API_URL=https://deep-space-ledger-app.vercel.app`
- `EXPO_PUBLIC_LEGAL_ENTITY_NAME=Kuan Yu Chen`
- `EXPO_PUBLIC_SUPPORT_EMAIL=dev@tenten.co`

2026-10-07 已將正式 Clerk publishable key 與獨立 API 網址設定至 EAS production。營運者與支援 Email 已在 2026-10-03 配置。Apple 登入開關已在 Apple 憑證與 Clerk connection 配置後設為 `true`；實際登入驗收仍等待正式 DNS。既有 TestFlight 1.0.0 (4) 不會因環境值更新而改變，仍需要新的正式 build。`lad-pocket.vercel.app` 保留 Maggie HTML prototype。

## Vercel Production

Public build values：

- 上述五個 `EXPO_PUBLIC_*`
- `EXPO_PUBLIC_ENABLE_DEBUG_TOOLS=false`（只有明確的內部驗收環境可暫時設為 `true`）

Server only：

- `CLERK_SECRET_KEY=sk_live_...`
- `DATABASE_URL=postgresql://...`（輪替後的 production credential）
- `CLERK_AUTHORIZED_PARTIES=https://lad-app.tenten.co,https://deep-space-ledger-app.vercel.app`
- `APPLE_TEAM_ID`
- `APPLE_KEY_ID`
- `APPLE_PRIVATE_KEY`（Sign in with Apple `.p8`，敏感）
- `APPLE_NATIVE_CLIENT_ID=com.tenten.deepspaceledger`
- `APPLE_WEB_CLIENT_ID`（Clerk Web Apple connection 的 Services ID）

## 平台設定

Clerk production instance：

Production instance 為 `ins_3K9Bp4mNXHEd1vJdBIksRwBE0hr`（app `app_3HsU8GmAoCcKIzyTkwh4PjQxp0S`）。2026-10-07 已新增自訂 domain `lad-app.tenten.co`，Frontend API 為 `clerk.lad-app.tenten.co`，DNS 與 Email 仍未驗證。已建立 iOS native app `RTK85AV2H2 / com.tenten.deepspaceledger`，並確認 `deep-space-ledger://sso-callback` 與自動建立的 `com.tenten.deepspaceledger://callback`。

- 正式 domain 與 `pk_live_`／`sk_live_`
- Native application：Apple Team ID + Bundle ID
- Mobile SSO redirect allowlist
- Google OAuth production credentials
- Sign in with Apple connection、Services ID、private key
- Email delivery、密碼規則、Client Trust／MFA 與 demo reviewer account 可用性

Apple Developer：

- App ID 啟用 Sign in with Apple
- Key／Services ID／Return URL 與 Clerk production 設定一致
- EAS credentials 建立後用實機測試 Apple 登入與帳號刪除

Vercel：

- Production deployment 不受 Vercel Authentication／SSO 保護
- `/privacy`、`/support`、`/account` 公開 200
- `GET /api/sync` 未登入回 401
- `DELETE /api/account` 未登入回 401；其他 method 回 405

## 人工確認旗標

本機 submission preflight 會要求：

- `PRODUCTION_SECRETS_ROTATED=true`
- `CLERK_NATIVE_APP_CONFIGURED=true`
- `CLERK_GOOGLE_OAUTH_CONFIGURED=true`
- `CLERK_APPLE_OAUTH_CONFIGURED=true`
- `APPLE_CONTENT_RIGHTS_STATUS=licensed` 或 `removed`

這些不是密鑰，只是擁有者完成平台設定與權利確認後的 release attestation；不得在尚未完成時提前填 true。

## 2026-10-07 部署狀態

- Vercel：`tentenco/deep-space-ledger-app`，project ID `prj_2O9QRjrN5IiXeoe2XqwS3OghyybU`。
- 公開 API：`https://deep-space-ledger-app.vercel.app`，sync/account 的未登入與無效 token 邊界通過。
- Neon：全新專案 `frosty-shape-90805190`（LadApp App Store Production），新加坡、Postgres 18、database `lad_app`。沒有沿用舊 LadApp 的憑證或資料。
- Vercel Production 已存正式 Clerk / Neon sensitive variables；公開 build 值、authorized parties、Apple Team ID / native client ID 已配置。Apple key `32FPF2MRV9`、private key 與 Web Services ID `com.tenten.deepspaceledger.web` 已保存並部署至正式 API。
- 舊開發環境曾暴露的憑證尚未撤銷，`PRODUCTION_SECRETS_ROTATED` 未勾選。
- Apple Developer 已由本人完成登入，Apple connection 已在 Clerk 啟用供登入／註冊。Cloudflare 等待本人雙重驗證，Google Cloud 等待本人重新登入。自訂 Web domain 加入 Vercel 回傳 `domain_not_owned`，尚待 DNS 所有權處理，不能稱為已可用。
- 詳細驗收、DNS 清單與送審阻擋見 `docs/APP_STORE_SUBMISSION_STATUS.md`。

Apple Services ID 綁定原有 primary App ID，回跳網址為 `https://clerk.lad-app.tenten.co/v1/oauth_callback`。Private relay email source 已註冊，SPF 仍待 DNS；`CLERK_APPLE_OAUTH_CONFIGURED` 驗收旗標尚未勾選。私鑰以 0600 權限另存 gitignored `credentials/apple-sign-in/` 作為不可重新下載的備份。

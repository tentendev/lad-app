# Production 環境與密鑰清單

## 必須先輪替

2026-08-14 前曾透過非 secret channel 分享的 Clerk secret 與 Neon connection string，視為已暴露。正式部署前要在 Clerk／Neon 產生新值並撤銷舊值；新值只能放在密碼管理器與平台的 encrypted/sensitive environment。

## EAS Production（會進 client bundle 的公開值）

- `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...`
- `EXPO_PUBLIC_ENABLE_APPLE_SIGN_IN=true`
- `EXPO_PUBLIC_SYNC_API_URL=https://lad-pocket.vercel.app`
- `EXPO_PUBLIC_LEGAL_ENTITY_NAME=...`
- `EXPO_PUBLIC_SUPPORT_EMAIL=...`

## Vercel Production

Public build values：

- 上述五個 `EXPO_PUBLIC_*`
- `EXPO_PUBLIC_ENABLE_DEBUG_TOOLS=false`（只有明確的內部驗收環境可暫時設為 `true`）

Server only：

- `CLERK_SECRET_KEY=sk_live_...`
- `DATABASE_URL=postgresql://...`（輪替後的 production credential）
- `CLERK_AUTHORIZED_PARTIES=https://lad-pocket.vercel.app`
- `APPLE_TEAM_ID`
- `APPLE_KEY_ID`
- `APPLE_PRIVATE_KEY`（Sign in with Apple `.p8`，敏感）
- `APPLE_NATIVE_CLIENT_ID=com.tenten.deepspaceledger`
- `APPLE_WEB_CLIENT_ID`（Clerk Web Apple connection 的 Services ID）

## 平台設定

Clerk production instance：

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

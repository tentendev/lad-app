# 上線營運與事件處理 Runbook

## 每次發布前

1. 跑 `npm run release:web`、`npm run release:ios:validate`、`vercel build`、`npm run verify:vercel-prebuilt`、`npm run preflight:ios-submit`。
2. 比對 `docs/PRIVACY_DATA_INVENTORY.md` 與所有新 SDK、API、log、分析或客服工具。
3. 以 production 測試會員完成 Google／Apple／Email 登入、重啟、上傳、衝突、下載、只刪備份、永久刪帳號。
4. 確認公開政策、支援、資料控制與 API unauthenticated boundary。
5. 先 Preview／TestFlight，驗收後才 promote／送審；第一版使用 Manual Release。

## 支援處理

- 公開信箱與內部負責人：待填。
- 工單只記錄完成處理所需的 Email、問題內容、時間、App／iOS 版本與非敏感錯誤文字。
- 絕不索取密碼、Email 驗證碼、Apple 2FA、Clerk token、完整 database URL 或 private key。
- 涉及會員資料時，以使用者目前已驗證的 Clerk Email 作為主要識別；不要接受第三人只憑 user ID 要求匯出或刪除。
- App 內已有直接帳號刪除；客服不得要求使用者先寄信或提供不必要證明。
- 法定資料權利請求的回覆期限依法律實體所在地與使用者適用法律由營運者／法律顧問設定。

## 安全事件

1. 記錄發現時間、受影響環境、資料類型與版本，不在一般聊天貼 secrets 或 user snapshot。
2. 立即撤銷／輪替受影響的 Clerk、Neon、Apple、Vercel、Expo credentials。
3. 必要時暫停 sync／account API，而不要破壞本機離線功能。
4. 查核 Vercel／Clerk／Neon logs；log 不得新增 bearer token、Apple token、密碼或 snapshot body。
5. 依適用法律評估通知主管機關與使用者；保存事件時間線與修復證據。
6. 修復後新增 regression test，再經 Preview／TestFlight 驗收。

## 備份、刪除與供應商

- Neon 備援保留期間、region、restore 能力與刪除後備份處理：待 production plan 確認並記錄。
- Clerk、Vercel、Neon 的 DPA、subprocessor、region 與安全文件：由法律實體擁有者接受並歸檔。
- 每季以測試帳號驗證完整刪除：Neon row 不存在、Clerk user 不存在；Apple 測試帳號另確認自動或手動 revoke。
- 不使用真實使用者資料做 QA。

## 監控與回復

- 建議監控公開 `/support`、`/privacy`、`/account` 200，以及 `GET /api/sync` 401、`GET /api/account` 405；不要在監控中使用使用者 bearer token。
- Production 異常時，先把上一個已驗證 Vercel deployment rollback；iOS binary 只能用新版本修復，必要時在 App Store Connect 暫停版本發布。
- App Store Review 回覆需指出實際路徑、build version 與測試方式；不要只貼政策文字。


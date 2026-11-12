# Agent 本機環境接手

查核日：2026-11-12。此次範圍為 SETUP、接受本人 App Manager 邀請及加入既有 Core QA；未授權新 build、上傳、送審或正式部署。依 Erik 當日交接信與兩份附件執行。

## 工作區與身分

目前工作區包含獨立的網頁與 Expo Repo。此目錄的 `origin` 是 `tentendev/lad-app`，`upstream` 是原作 `its-maggie/lad-app`；介面與共用資料同步仍遵守 `AGENTS.md`。AO3 是其他專案。

| 用途 | 應核對的值 |
| --- | --- |
| GitHub | 本人 `its-maggie`，Expo Repo 權限 `WRITE` |
| Expo | 本人 `its_maggie`，工作通知使用公司信箱，`tentenco` 的 `Developer` |
| Apple | 使用收到最新邀請的本人 Apple Account；可與公司信箱不同，實際地址僅記於本機狀態 |
| Expo project | `@tentenco/deep-space-ledger` |
| Expo project ID | `46cd6a19-3d6a-4b81-b08b-a531cb15664f` |
| iOS bundle／Android package | `com.tenten.deepspaceledger` |
| Apple Team ID | `RTK85AV2H2` |
| App Store Connect App ID | `6812909987` |
| Expo Web／API | `tentenco/deep-space-ledger-app`，`prj_2O9QRjrN5IiXeoe2XqwS3OghyybU` |
| 原作 HTML production | `lad-pocket.vercel.app` |

`eas.json` 的 `dev@tenten.co` 是既有上傳設定，不是同事共用的 Apple 登入。歷史交接檔裡的瀏覽器工作空間、憑證路徑、發布狀態只供參考，必須以這台電腦的實際查核為準。

## 工具與能力狀態

| 項目 | 狀態與證據 |
| --- | --- |
| 工具 | macOS arm64；Node 22.17.0、npm 10.9.2、Git 2.47.0、gh 2.97.0、Codex CLI 0.167.0、EAS CLI 27.7.2；ego-browser guide 2.2.0 |
| 依賴與來源 | 既有 `npm ci` 安裝可沿用，`npm ls --depth=0` 通過；相對昨日通過完整 gate 的 `7b4111b`，目前只增加文件／本機設定排除規則 |
| GitHub | READY：`gh auth status` 為本人；Repo API 為 WRITE，main 的有效 rules 查詢為空陣列；每次提交前仍需重新確認規則 |
| Expo／EAS | READY：`whoami`、`project:info` 及只讀 `build:list` 成功，沒有建立新 build |
| UI_READY | READY：隔離於 `127.0.0.1:8081` 的 Web 主流程可載入，測試花費重新開啟仍存在，並已刪除；本次結果見 `.agent-local/setup-status.json` 與 `evidence/` |
| PREVIEW_AUTH_READY | BLOCKED（登入驗收待測）：Clerk 測試公開金鑰、登入表單與 `Clerk.loaded` 正常，尚未登入專用測試會員，不代表登入流程已驗收 |
| Expo MCP | NEEDS_RESTART：已新增官方遠端連線並儲存 OAuth，帳號為本人，範圍只選 `tentenco: Runner`、Free；目前對話未載入新工具，重啟後仍須只讀查詢成功才能標成 READY |
| Apple／Core QA | READY：本人新邀請已接受，角色確認為「App 管理」；已加入既有 Core QA，群組 1 人、6 個 build，1.0.0（8）為「準備測試」。既有外部資格及 Build 6 安裝紀錄仍保留；手機更新至 Build 8 尚待本人操作 |
| Apple 範圍核對 | 待 Erik 核對：本人設定頁標籤為「所有 App」，檢視清單目前只有深空省省；這與交接信指定的單一 App 範圍標示不同。未變更本人或他人的角色／App 範圍 |
| BACKEND_READY | BLOCKED（完整流程待驗收）：正式排期 HTTP 200、`GET /api/sync` 無登入 401、`GET /api/account` 405；這些只證明公開及方法／驗證邊界 |
| PRODUCTION_QA | BLOCKED：登入、雲端備份、衝突、刪帳號及 Apple 撤銷尚無本次本人實機證據 |
| 原生／Android | 本機 Simulator 工具不可用；未配置 Android SDK／Play 簽署，未要求安裝；不得將 Web 或 Hermes 匯出稱為實機驗收 |
| Vercel／正式發布 | 本次 NOT_REQUESTED；PATH 沒有 Vercel CLI。平台已確認提示新版 Apple Developer Program 許可協議需由 Account Holder 檢視接受；簽署保護與遠端憑證權限仍待後續有發布授權時查核 |

昨日 `npm run release:ios:validate` 的對應來源驗證包含 ESLint、TypeScript、15 項 Node + 184 項 Vitest 測試、Doctor 21/21、既有政策下的 production 依賴稽核、8.6 MiB iOS Hermes 匯出與 build preflight。完整狀態分開記錄，不以一個「全部完成」取代缺項。

## 開始開發

在本 Repo 執行：

```sh
npx eas-cli@27.7.2 whoami
npx eas-cli@27.7.2 project:info
npm run sync:expo-data
npm run web
```

開啟終端印出的網址，通常為 `http://localhost:8081/schedule`。`npm run preview` 與父資料夾的 `預覽App.command` 是略過會員的 development-only 模式；需要測試會員入口時使用 `npm run web`。

`.env.local` 已存在、權限為 600，Git 忽略；只含三個公開值：`EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`（測試 key）、`EXPO_PUBLIC_LEGAL_ENTITY_NAME`、`EXPO_PUBLIC_SUPPORT_EMAIL`。重跑設定時保留它。新 checkout 才依快速開始文件下載 preview；已有檔案需先下載至另一個被忽略的路徑再安全比較，不輸出值。

Web API 使用同源 `/api/*`；preview Clerk 與正式 API 不是同一個登入環境。本次不拉 Clerk secret、Neon URL 或 Apple private key。`.agent-local/` 同時受 Git 與 EAS 排除，原始附件與個人帳號資訊保存在其中，目錄 700、檔案 600。

## Expo MCP 接續

官方 endpoint 為 `https://mcp.expo.dev/mcp`，使用 OAuth。已保留既有 Codex MCP 設定，只新增 `expo`。目前客戶端的設定與 OAuth 已就位，尚無此對話直接呼叫 Expo MCP 的證據。

```sh
codex mcp list
codex mcp login expo --no-browser
```

第二行只在確實需要重新登入時使用；以 ego lite 開啟 CLI 印出的授權網址，核對本人帳號及 `tentenco`。重啟／重連後，使用只讀專案或 build 查詢驗證；不要啟動 build、workflow、usage budget 或 sandbox 來測連線。EAS CLI 的只讀查詢已可用，MCP 的方案或 SDK 限制不應造成升級套件或購買方案。

本 Repo 維持 SDK 57；官方 MCP 文件目前以最新 SDK 為前提。未安裝 `expo-mcp`、未啟動本地 MCP 自動化，也沒有可用 Simulator；這些能力需有原生工作需求時另查相容性。

依據：[Expo MCP 官方文件](https://docs.expo.dev/mcp/)、[OpenAI Docs：MCP 設定與 OAuth](https://learn.chatgpt.com/docs/extend/mcp?surface=cli)。

## Apple 接手紀錄與後續操作

2026-11-12 已完成本人個人開發者帳號及 App Store Connect 的首次啟用，確認目前登入的是本人的 Apple Account，App ID 為 `6812909987`，角色為「App 管理」。Core QA 原為 0 人，查重後只加入本人，平台顯示 1 位測試人員；既有 1.0.0（8）已在群組且可供測試，沒有建立新 build。外部 Maggie & Erik UI Testing 仍有本人的已安裝 1.0.0（6）紀錄。

本人使用者設定頁目前顯示「所有 App」，檢視 App 清單為 1 個深空省省。本人頁面只有檢視清單功能，未修改範圍；需由 Erik 核對是否已依原交接限制為單一 App。另有 Account Holder 的新版 Program 許可協議待處理，與此次本人的首次使用條款是不同事項。

下列流程供未來接手或資格異動時使用；重跑前先查實際狀態，不重複加入：

1. 在 ego lite 登入個人 Gmail，開啟 2026-11-12 最新 App Store Connect 邀請；舊公司信箱邀請已撤回。
2. 使用相同的本人 Apple Account 接受邀請並完成 2FA，確認 Apps 能看到「深空省省」。只讀取需要的狀態，避免擷取商店審核密碼表單。
3. App Store Connect → 深空省省 → TestFlight → Internal Testing → 既有 `Core QA` → Testers → `+`，先查本人是否已存在，沒有才加入。確認實際儲存成功，並記錄群組可用的既有 build。
4. 保留 `Maggie & Erik UI Testing` 外部資格；既有外部安裝 Build 6 是 Erik 信件確認的歷史狀態，不等於此次已驗證本人安裝新版。
5. 若無管理權限，由 Erik／既有管理者補入 Core QA；不借用擁有者登入。Account Holder 專屬協議也由本人處理。

目前 Build 8 的 production EAS UUID 為 `a82f35ed-ff40-46eb-aada-1a179c6cb131`，來源 `7dd6764`、版本 1.0.0（8），查詢為 FINISHED；這是既有建置，不含 Maggie 後來的本機視覺修改。只加入群組不會將工作分支改動更新至手機。

後續發布步驟見 [RELEASE_RUNBOOK.md](RELEASE_RUNBOOK.md)。

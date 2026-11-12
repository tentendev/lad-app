# 深空省省開發與發布操作

此文件與 `AGENT_SETUP.md`、`AGENTS.md` 一起閱讀。每次先核對本次要求；SETUP、接受邀請或加入測試者，只做設定及成員管理。新的雲端建置、上傳 TestFlight、正式送審及 Web production 各依實際授權執行。

## 來源、分支與驗證

```sh
git status --short --branch
git fetch origin
gh auth status
gh repo view tentendev/lad-app --json nameWithOwner,viewerPermission,defaultBranchRef
npx eas-cli@27.7.2 whoami
npx eas-cli@27.7.2 project:info
```

確認 Repo、本人帳號及 `@tentenco/deep-space-ledger`，保留工作樹。以工作分支修改 `.native.tsx`、`.web.tsx` 及所需的共用邏輯。同步排期、公告與價格時依 `AGENTS.md` 處理四份根目錄來源，不直接改產生的 TypeScript 資料。

```sh
npm run sync:expo-data
npm run check
npm run release:ios:validate
git diff --check
git status --short
```

依變更與目標選 gate；`release:ios:validate` 已包含 `check`，同一份來源剛通過時不需重複執行兩者。Web 使用 ego lite 測主流程與資料保存；原生日期、鍵盤、字級、安全區域、登入及 Apple 撤銷需 Simulator／實機另驗收。

新 checkout 使用固定 lockfile 的 `npm ci`；不因新版本提示升級 Node 主版本、Expo SDK、React Native 或套件管理器。`.env.local`、`.vercel/`、簽署資料與 `.agent-local/` 不得進 Git 或 EAS archive。

## 發布版本與來源提交

先只讀查詢目前版本與遠端建置：

```sh
npx eas-cli@27.7.2 build:list --platform ios --limit 5 --non-interactive
```

需要新 TestFlight build 時，選取未被使用的 marketing version，同步 `app.json` 的 `expo.version` 與 `store.config.json` 的 `apple.version`。EAS 使用 remote version、production `autoIncrement`，不手動重設 build number。

目前未發布的視覺分支 `expo.version` 已是 1.0.1，商店設定仍是 1.0.0。此次 SETUP 保留這個狀態；下一次有建置授權時必須先處理版本一致性。既有 1.0.0（8）已發布的狀態來自交接，仍以平台即時查詢為準。

檢查本次檔案及 staged diff，提交後推送工作分支；不要把整個工作樹的其他修改一起加入，也不要直接改 main。Git commit 作者及 HTTPS credential helper 必須對應本人帳號。

## 建置與上傳 TestFlight

確認來源 commit 的 `release:ios:validate` 通過、簽署權限與憑證保護可用、Apple 協議已處理後，才使用既有遠端憑證：

```sh
npx eas-cli@27.7.2 build --platform ios --profile production --non-interactive --freeze-credentials
```

production 使用正式服務。`preview` 是 ad-hoc，不可當作 TestFlight store build；`testflight-ui` 是 preview 服務的 store build，僅供明確授權的內部 UI 測試。不要因驗證失敗建立新 bundle ID、Expo project、簽署憑證或改 owner。

記錄這次實際 UUID，再查明確建置；下列 `THIS_BUILD_UUID` 必須替換為該 UUID：

```sh
npx eas-cli@27.7.2 build:view THIS_BUILD_UUID
npx eas-cli@27.7.2 submit --platform ios --profile production --id THIS_BUILD_UUID --non-interactive --wait
```

上傳前確認 FINISHED、來源 commit、版本／build、環境、bundle ID 與實機 IPA。`ios-review-simulator` 也可能顯示 distribution STORE；不能只靠這個欄位判斷可上傳。不可使用 `--latest` 誤選其他人的 Simulator 或建置。

沿用既有 App Store Connect 上傳 API key；`appleId: dev@tenten.co` 不代表需要分享該帳號密碼。憑證或 Apple 協議錯誤交給具權限的 Erik／Account Holder；一般開發者不下載正式 server secrets，也不填寫沒有完成驗收的 release flags。

## 測試群組及手機驗收

在 ego lite 登入本人 Apple Account，進入數字 App ID `6812909987` 的深空省省：

- 內部：先確認本人 App Manager 邀請已接受，再於 TestFlight → Internal Testing → 既有 Core QA → Testers 加入本人；先查重複，再確認需要的明確既有 build 已在群組。
- 外部：沿用 Maggie & Erik UI Testing，不刪除或重建本人既有資格。新外部版本若需 Beta App Review，依授權填寫實際變更與測試範圍後送審，記錄核准及 Testing 狀態。
- 手機：由本人在 TestFlight 更新，確認版本、build 及資料保留，再驗證功能與 production 登入／雲端流程。沒有裝置證據時保持 DEVICE_QA_PENDING。

分別記錄 EAS 完成、上傳成功、Apple 處理、Beta Review、群組可用與本人安裝結果。加入 Core QA 不會把未建置的本機 UI 改動送到手機。

## 正式 App Store／Web

App Store 依 `IOS_RELEASE_PREPARATION.md`、`APP_STORE_REVIEW_PACKAGE.md` 與 production release gates 完成資料、截圖、隱私、內容權利、正式帳號及實機驗收。`preflight:ios-submit` 所需的秘密與人工驗收由有權限的 release owner 在受保護環境處理。送審前核對平台實際的自動／手動發布設定，記錄版本與審核狀態，公開上架後另查目標地區商店頁。

Web／API 僅指向 `tentenco/deep-space-ledger-app`，以 `DEPLOYMENT_HANDOFF.md` 的平台識別資料為準，不沿用歷史機器的 session 或密鑰。這台 Mac 尚無 Vercel CLI；有 Web 部署要求時先安裝相容官方 CLI、核對本人登入／權限及專案，再依下列順序準備：

```sh
npm run release:web
npm run verify:vercel-prebuilt
npm run preflight:web-deploy
```

先建立待驗證部署，驗證明確 deployment ID 的頁面、API、build ID 與主流程，通過後依授權 promote，最後執行 `npm run verify:web-deployment -- https://deep-space-ledger-app.vercel.app`。保留可回復的上一份部署；Web rollback 不等於回復已發布的手機 binary。正式伺服器秘密留在平台，資料庫變更與破壞性測試需另有明確範圍。

工具與目前能力見 [AGENT_SETUP.md](AGENT_SETUP.md)，首次登入見 [快速開始](MAGGIE_DEVELOPMENT_QUICKSTART.md)。

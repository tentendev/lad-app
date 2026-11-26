# 2026-11-26 內部 UI 測試版

使用者希望恢復 App 預覽，並在 TestFlight 查看目前累積的 UI 與功能。此次以內部測試為範圍，沿用 `testflight-ui` profile、EAS `preview` environment、既有 App 身分及遠端簽署設定。沒有 App Store 正式送審、公開發布或會員／雲端服務變更。

## 版本與內容

- 基於 `0ff7df3` 的目前開發成果，包含 02A 霧光星軌介面、換算與活動規劃、三幣別錢包、追蹤、最新排期、月／週卡成本收合區塊，以及問卷選填聯絡方式與 Threads 入口。
- `app.json` 與 `store.config.json` 的版本對齊為 **1.0.1**；build number 由 EAS 遠端自動遞增。
- 維持 Expo SDK 57，只依 Expo Doctor 的結果套用相容修補版本並更新 lockfile。
- 目前未設定 EAS Update；這次測試需要新的 TestFlight 安裝包。
- 2026-11-26 只讀 EAS 查詢：最新可安裝的實機建置為 **1.0.0（8）**，UUID `a82f35ed-ff40-46eb-aada-1a179c6cb131`、來源 `7dd6764`。較新的 Simulator 產物不能上傳 TestFlight。

## 本機驗證

- `npm run release:ios:validate` 通過：ESLint、TypeScript、15 項 Node 與 223 項 Vitest 測試、Expo Doctor 21/21、既有政策下的 production 依賴稽核、8.5 MiB iOS Hermes 匯出及 build preflight。
- 瀏覽器確認最新排期、換算摘要及月／週卡收合區塊可載入；390px 換算頁無水平溢出。
- 預覽為 `http://localhost:8081`，可雙擊工作區的 `預覽App.command` 重新啟動；需要保留預覽終端機視窗。
- 瀏覽器驗證使用 `127.0.0.1:8081` 的獨立 origin，不修改 `localhost` 的既有使用者紀錄。
- 本機尚無可用 Simulator；上述檢查不代表原生實機驗收完成。

## 手機待確認

1. 首次使用、字級、頁首、底部分頁與安全區域。
2. 錢包新增／編輯花費、幣別及預算、重新開啟後資料保存。
3. 換算數值、卡池與金券設定、月／週卡成本展開，以及禮包帶入錢包。
4. 排期月份／男主篩選、活動展開，以及加入規劃。
5. 追蹤紀錄、問卷確認視窗與 Threads 連結。
6. 數字鍵盤、日期選取、捲動與返回行為。

此版本使用測試會員環境；正式 Apple 登入、雲端備份、衝突及刪帳號仍需另以正式環境驗收，不以 UI 測試通過代替。

## 發布狀態

- EAS 建置 **FINISHED**：版本 **1.0.1（9）**，來源 `6b27536f352a78e3b0454bba321c6a8d9f28b405`；[建置紀錄](https://expo.dev/accounts/tentenco/projects/deep-space-ledger/builds/7f899133-1a88-47d9-82ae-8ff072ffdc06)。完成時間為台北 2026-11-26 12:58。
- IPA 為實機 App Store 發行簽署，bundle ID、版本、build number 與 Team ID 均符合既有設定。`codesign --verify --deep --strict` 通過；簽署描述檔有效至 2027-09-17。IPA 大小 30,336,177 bytes，SHA-256 為 `e1c0eec7a4ef7f229090c44c9105f1379b8a6ebe9dfec1922948ec6dfd9a5957`。
- 以既有 EAS 上傳 API key 指定 **Core QA**，未新增測試者／群組，也未指定外部群組。[上傳紀錄](https://expo.dev/accounts/tentenco/projects/deep-space-ledger/submissions/2a3f1603-e67a-4c06-95bd-a7f18ac0b838) **失敗**：Apple 回報必要協議尚未接受或已到期。這不是已上傳、Apple 處理中或已可安裝的狀態。
- 當日使用者完成本人登入後，App Store Connect 使用者清單確認：Maggie 為 **App 管理**，`dev@tenten.co` 為 **帳號持有人／管理**。本人 Apple Developer 帳號頁沒有這個團隊的持有人協議可處理；未切換／借用持有人帳號，也未接受任何新條款。
- 當日 TestFlight UI 仍只有 1.0.0，最新 build **8** 已在 Core QA，顯示 1 次安裝；**1.0.1（9）尚未出現在 TestFlight**。既有外部 Maggie & Erik UI Testing 保留。
- EAS 的 `--what-to-test` 會因目前方案非 Enterprise 而拒絕排程；後續標準上傳不使用此旗標，測試清單保留於此文件，未升級方案。
- 非秘密的建置、驗證、IPA 與上傳收據位於受忽略的 `.agent-local/testflight-ui-20261126-*`。乾淨建置工作目錄 `/private/tmp/lad-testflight-ui-20261126` 保留；既有未追蹤的設計提案未加入建置或提交。

## 解除協議阻擋後重試

需要由 `dev@tenten.co` 的帳號持有人，於 [Apple Developer 帳號頁](https://developer.apple.com/account/) 審閱並接受待處理協議；若 [App Store Connect 商務／協議](https://appstoreconnect.apple.com/business) 也有必要待辦，需一併確認。上傳服務只回報必要協議未生效，尚未取得持有人視角的確切協議名稱。App 管理不能代替持有人接受更新協議，見 [Apple 角色規則](https://developer.apple.com/help/account/access/roles/)。

使用者確認協議已接受後，沿用已完成的同一份安裝包重試，不建立新 build：

```sh
EXPO_APPLE_TEAM_ID=RTK85AV2H2 npx eas-cli@27.7.2 submit --platform ios --profile production --id 7f899133-1a88-47d9-82ae-8ff072ffdc06 --groups 'Core QA' --no-auto-testflight-setup --non-interactive --wait
```

完成後另查 Apple 處理狀態、Core QA 可用版本，以及本人手機實際安裝結果；不因 EAS 建置成功就宣稱已更新手機。

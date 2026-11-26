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

建置與上傳收據待完成後補入。App Store Connect 的現有瀏覽器登入已過期，測試群組的最新狀態仍待本人登入確認。

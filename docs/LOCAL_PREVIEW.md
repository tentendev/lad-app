# 在電腦上預覽深空省省 App

## 這台 Mac 直接可用的方式

開啟工作區父資料夾的 `預覽App.command`，即可啟動瀏覽器預覽。開發套件已安裝，預覽網址為 **http://localhost:8081**。

也可以在終端機執行：

```sh
cd "/Users/maggie/Desktop/Agents/Codex/06-05-Maggie-LAD/深空省省App"
npm run preview
```

啟動後保留終端機視窗；修改程式會自動更新畫面。停止時在該視窗按 `Control+C`。若剛下載到另一台電腦，需先安裝 Node.js 22.13 或更新版本，再執行 `npm ci`。

`preview` 會先從專案根目錄的 `schedule.js`、`updates.js`、`packs.js`、`regional-prices.js` 產生 Expo 資料。這個步驟不會自行下載 Maggie 網頁專案的最新修改；跨專案同步需先複製或整理這四份來源資料。

## 可以驗證什麼

這是同一份 Expo App 專案的 Web renderer，可以操作排期、換算、三種幣別的錢包、規劃及五星追蹤。將瀏覽器視窗縮窄，也能先檢查窄螢幕排版。Web 與原生 renderer 共用資料與 domain 計算，原生按鈕、日期選擇器、鍵盤及 Apple 登入則需要模擬器或實機驗證。

本機預覽以明確的 development flag 啟用，未連線 Clerk 會員或 Neon 雲端備份；不需要正式帳號、私鑰或資料庫。預算、花費與換算輸入會存於本機瀏覽器，與正式網站、手機已安裝 App 的資料分開。正式 production bundle 不啟用這項略過會員的預覽設定；登入服務仍保留原本的必要設定檢查。

## 要看真正的 iPhone 原生畫面

這台 Mac 目前的開發工具路徑為 `/Library/Developer/CommandLineTools`，未找到可用的 `simctl`。使用 iPhone Simulator 前需安裝完整 Xcode 與對應的 iOS Simulator runtime；設定方式見 [Expo 官方 iOS Simulator 文件](https://docs.expo.dev/workflow/ios-simulator/)。

工具安裝完成後，在 App 資料夾執行：

```sh
npm run preview:ios
```

此命令會建立本機原生專案並嘗試啟動模擬器。原生建置的環境需求、首次編譯與裝置測試需另外驗證；本次已驗證 TypeScript 與 Hermes iOS bundle，尚未執行原生模擬器。完整登入、雲端備份與發行版驗收需使用正確的平台設定與實機／TestFlight。

## 本次同步（2026-11-04）

- 排期、最新核准公告及 2027 預測，以 Maggie 網頁版 `0f0ed71` 為來源；不新增功能公告。
- 月卡／生日／混池復刻分開計算返券、禮包階級與限購；舊復刻選項遷移至生日復刻，保留既有新分類選擇。
- 支援手動官方金券、恢復自動、重設換算，以及 TWD／HKD／MYR 的地區售價及記帳。實價、推估與未知價格分別呈現；缺價的禮包不可記帳。
- 預測活動即使結束仍保留預測標示；月曆依重疊活動增加列數。
- 備份格式升為 v5，保留幣別、分幣別預算與官方金券設定；支援讀取舊版備份。
- 原本追蹤、活動規劃及雲端功能繼續保留。新格式的雲端 API 與 App 必須搭配更新後的程式一起部署，發布前需另做正式服務驗收。

本次未發布 App Store／TestFlight，也未變更原網頁正式站。

## 驗證紀錄

- App `npm run check`：ESLint、TypeScript、15 項 Node 測試與 129 項 Vitest 測試通過；Vitest 的 alias 使用 `fileURLToPath`，支援目前含中文的資料夾名稱。
- `npm run verify:ios-bundle`：8.6 MiB Hermes iOS bundle 通過。
- 網頁原專案的 40 項 Node 測試通過；四份共用來源檔案逐字相同。
- Ego Lite：最新公告、11 月排期、四條重疊活動、復刻返券、手動金券 0 的重新整理保存、馬幣禮包帶入錢包、RM4.9 記帳、台幣／馬幣隔離與 RM0.82 六個月平均、追蹤入口、離線會員提示、390px 無水平溢出。測試新增的花費已移除。

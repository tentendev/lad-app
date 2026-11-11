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

## 使用 Erik 的 preview 環境

這台 Mac 已登入 Maggie 的 Expo 帳號 `its_maggie`，接受 `tentenco` Developer 邀請，並確認既有專案 ID 正確。已依交接文件透過 `eas-cli@27.7.2` 將 preview 設定下載至 `.env.local`；此檔案受 Git 忽略且權限為 `600`，內容只有 Clerk 測試用公開金鑰、公開營運者名稱及支援信箱。

要開啟含測試會員入口的預覽，使用：

```sh
npm run sync:expo-data
npm run web
```

目前開發伺服器使用上述模式，網址為 **http://localhost:8081/schedule**。`npm run preview` 與父資料夾的 `預覽App.command` 仍提供免連線會員的本機預覽模式。兩個模式使用相同的瀏覽器本機資料；測試會員登入不等於正式 Apple 登入或正式雲端備份已驗收，完整流程須在 production TestFlight 另測。

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

## 視覺基準與修改（2026-11-11）

App 以同層網頁版 `index.html` 的星空背景、白色線稿品牌、半透明紫色卡片、細白框、20px 卡片圓角與 13px 按鈕圓角為基準。瀏覽器預覽沿用原網頁的 Noto Sans TC、Noto Serif TC 與 Cormorant Garamond；原生版使用系統字體與系統襯線字體，保留動態字級、至少 14pt 的輔助文字與 48pt 的主要觸控範圍。

錢包的幣別選擇放入預算卡片，預算設定可展開，支出洞察移至花費紀錄後。換算輸入與結果集中在同一張卡片；規劃與追蹤保留原有功能，移除額外的英文小標。手機版的卡池、幣別及新增花費類別採用與原網頁相近的選擇欄位，點開後用可捲動的原生清單操作；原生日期選擇、鍵盤避讓及安全區域繼續保留。原生與 Web 檔案需一起維護，只修改 `.web.tsx` 不會改到手機原生畫面。

預覽預設隱藏內部診斷浮動按鈕；需要診斷時可設定 `EXPO_PUBLIC_ENABLE_DEBUG_TOOLS=true` 啟動。此設定不涉及會員或正式服務金鑰。

本次驗證涵蓋瀏覽器中的主要分頁、窄螢幕版面、換算與記帳保存、幣別隔離，以及 iOS／Android Hermes bundle。尚無可用的本機 Simulator，原生選擇清單、系統字型與動態字級仍需後續實機驗收。此次修改尚未發布到 TestFlight。

## 驗證紀錄

### Erik 開發交接整合（2026-11-11）

依 `docs/MAGGIE_DEVELOPMENT_QUICKSTART.md` 與 Erik 當日交接信，在 `maggie/web-visual-alignment` 工作分支整合 `origin/main` 的 `d106d89`，包含 Build 8 來源 `7dd6764`。保留本機 `4fa519c` 的資料／幣別修改及 `6d35c61` 的視覺對齊，並合併新版 Apple 刪除授權修正、網址解碼修正、iPad 工作區與可見選項調整。Expo version 已準備為 `1.0.1`；App 身分、EAS 專案與遠端憑證設定沿用既有值。

Node.js 為 `22.17.0`，已執行 `npm ci`，並確認指定的 `eas-cli/27.7.2` 可用。`npm run release:ios:validate` 通過：ESLint、TypeScript、15 項 Node 測試、184 項 Vitest 測試、Expo Doctor 21/21、既有審查政策下的 production 相依套件稽核、8.6 MiB iOS Hermes 匯出與 build preflight。

Expo 已以 `its_maggie` 接受 Developer 邀請並完成這台 Mac 的 EAS CLI 登入；`whoami` 與 `project:info` 確認 `@tentenco/deep-space-ledger`、專案 ID `46cd6a19-3d6a-4b81-b08b-a531cb15664f`。GitHub 已切換至本人 `its-maggie`，接受 `tentendev/lad-app` 協作者邀請，API 確認有 push 權限；此專案後續提交的本機作者設定也已切換為 Maggie。工作分支為 `maggie/web-visual-alignment`，不合併或推送至 `main`。

preview 的 `.env.local` 已拉取，使用 `npm run web` 啟動後，以 Ego Lite 確認排期月曆、換算、錢包、追蹤頁及 Clerk 測試會員登入表單可載入，`Clerk.loaded` 為 `true`。排期月曆及錢包未出現水平溢出。未登入測試會員，也未測試正式雲端 API；原生實機驗收仍待進行。

App Store Connect 最新邀請已開啟至 Apple 帳號登入頁，需要 Maggie 使用自己的 Apple Account 登入及完成驗證後，才能確認 App Manager 權限及 Core QA 測試群組。此次尚未建立或上傳新的 TestFlight build。

Erik 信中另提醒新版 Apple 開發者協議需由 Account Holder 審閱接受；這一步不屬於 Maggie 的 App Manager 權限，目前尚未查驗其最新完成狀態。

### 11/4 本機同步驗證

- App `npm run check`：ESLint、TypeScript、15 項 Node 測試與 129 項 Vitest 測試通過；Vitest 的 alias 使用 `fileURLToPath`，支援目前含中文的資料夾名稱。
- `npm run verify:ios-bundle`：8.6 MiB Hermes iOS bundle 通過。
- 網頁原專案的 40 項 Node 測試通過；四份共用來源檔案逐字相同。
- Ego Lite：最新公告、11 月排期、四條重疊活動、復刻返券、手動金券 0 的重新整理保存、馬幣禮包帶入錢包、RM4.9 記帳、台幣／馬幣隔離與 RM0.82 六個月平均、追蹤入口、離線會員提示、390px 無水平溢出。測試新增的花費已移除。

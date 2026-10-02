# 2026-10-03 Maggie / Expo 同步驗證

## 程式與建置來源

- Maggie upstream：`521e7be`（2026-10-02），保留唯一最新 approved 公告。
- Expo 合併與實作：`93ebcbddddb7c1928f120a54cbf82952d4c0b77c`，已推送 `tentendev/lad-app` main。
- EAS 完整 Simulator build：`1b9c5248-7cf5-458f-9b82-fcf7c086ef24`。
- EAS 簽署 iOS build：`edba79ee-be28-4577-b2b3-72a4f4680f46`，TestFlight UI profile，1.0.0 (4)。此 profile 使用 preview 環境，不是正式登入／後端驗收版本。

## 自動檢查

`npm run check` 通過 lint、TypeScript、9 個 Node script tests 及 119 個 Vitest tests（共 128 個）。`npm run doctor` 21/21、`security:audit`、Web export / verification、8.6 MiB Hermes iOS bundle verification 及 iOS build preflight 均通過。

source parity test 涵蓋 7 種池型、目標 0–300，共 2,177 組對照。混池 51、54、55 抽可用金券分別為 11、14、15，超過目標才發出的里程碑返券不再提前折抵。

## Web 與原生畫面

- 最新公告 `2026-10-02-rafayel-and-notices` 原文對齊 Maggie；日期 2026-10-02、標題「祁煜長思入畫復刻｜10/3–10/10」。不新增歷史公告或自動發布其他公告。
- Web 首次開啟、Escape 關閉、已讀持久化、跨頁重新查看公告通過。CSS viewport 320 px 與桌面未出現水平溢出。瀏覽器 host zoom 為 80%，Web 截圖邊界包含 emulation 顯示區，不能用來主張精確像素對照。
- 完整新 Simulator build 安裝至獨立 iPhone 17 Pro Max 及 iPad Pro 13 吋（iOS 26.5）測試裝置。
- 首次 Welcome 關閉後才顯示最新公告；兩者沒有重疊。公告關閉後可用頂部鈴鐺重新開啟。
- 月曆有最新活動資料，周邊使用綠色，已結束的暫定活動以實心／已結束狀態顯示。
- iPhone 原生錢包：設定 10 月預算 3000，新增抽卡禮包花費 150，總額為 NT$150、餘額 NT$2,850、已用 5%、1 筆紀錄。終止並重開 App 後仍保留上述數據（`iphone-wallet-persistence.png`）。
- iPhone 原生換算：混池、目標 51 抽、鑽石 3000，顯示 11 張可折抵金券（10 張免費 + 1 張返券），與 Maggie 相符。
- iPad 月曆與公告實際檢視，字級與內容可讀；13 吋截圖為 2064 × 2752。
- 大字級公告另以先前 native binary 配合新 Hermes bundle 進行迭代測試（`iphone-notice-large-text.png`）；該張只作迭代證據。完整建置驗證使用 `iphone-notice.png` / `ipad-notice.png`，不混用兩者來源。

## 已上傳 App Store Connect 的素材

- iPhone 6.9 吋 1320 × 2868：`iphone-schedule.png`、`iphone-wallet.png`、`iphone-calculator.png`。Apple 同時產生 6.5 吋素材。
- iPad 13 吋 2064 × 2752：`ipad-schedule.png`。
- 圖片均為實際 App UI，沒有生成、修圖或套入假資料模板。`iphone-wallet.png` 是加入花費前的預算畫面，持久化驗收另存新檔，未覆寫已上傳素材。

## 正式送審限制

`app-review-preflight.txt` 記錄 16 項未滿足條件，主要為 production Clerk / Apple / Google、正式 API 的 401/405 邊界、credentials 輪替及第三方內容使用權。最後一行「沒有啟動…」只描述該唯讀 preflight 本身；本次另有實際 Simulator / TestFlight UI build 與 Apple 上傳作業，不能據此推論沒有進行建置。

正式 App Review 尚未提交。Store metadata、截圖與 App Privacy 已準備／保存，不代表正式登入與後端已驗收。

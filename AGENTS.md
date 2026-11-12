# 深空省省

原創者 Maggie 的 `its-maggie/lad-app` 是原生 HTML / CSS / JavaScript 靜態網站，透過既有 GitHub Actions 部署至 Vercel。`tentendev/lad-app` 保留這份原作，另有 Expo Web／iOS／Android；原作是設計、排期與公告的同步來源。Maggie 的 HTML production 部署只在原作 Repo 執行，不在 Expo fork 自動觸發。

## 發布更新

- 更新官方排期時，同步修改 `schedule.js` 的日期、`tentative` 與 `SCHEDULE_META.updated`。
- 排期公告依使用者提供的更新內容撰寫，忠實區分官方確認與預測；使用者指定不公告的排期不可自行加入。
- 功能公告只有在使用者明確要求公告該功能時才發布。UI、樣式、文案和一般功能調整都不自動產生公告。
- `updates.js` 的 `window.SITE_UPDATES` 只保留最近一次公告，不累積舊公告，也不提供過往更新入口。每筆包含 `id`、台北日期 `date` 與 `items`。
- `items` 每筆使用 `type: "schedule"` 或明確獲准的 `"feature"`、`title`、`body`。文字描述實際變更，勿把未確認排期寫成官方資訊。
- 發布實質新消息時使用新的唯一 id，同一天再發布也要換 id。單純刪減公告、修整 UI 或移除未獲准內容時，保留所留下公告的原 id，避免已讀訪客再次收到相同消息；不要公告這類維護操作。
- 官方同步腳本會自動新增排期公告；不要為同一批同步重複新增。
- 發布前執行 `node --test scripts/*.test.mjs`，檢查 JavaScript 語法，並確認更新通知位於所有功能分頁之外。

## 共用資料與本機預覽

- 2026-11-12 起以 App 為開發主線，UI、功能、會員與研究文件只改本 Repo；同層 HTML 網頁版維持現況。只有排期更新時同步兩版排期及該次獲准的排期公告。整體視覺採「02A 霧光星軌・原版」，不要套用 02B 修訂版。
- 本機網頁來源位於同層 `../深空省省/`。更新排期／公告／禮包時依需要同步 `schedule.js`、`updates.js`、`packs.js`、`regional-prices.js`，再執行 `npm run sync:expo-data`。
- `src/data/schedule.ts`、`src/data/siteUpdates.ts`、`src/data/packData.ts` 是產生的資料，不直接手動修改。
- `npm run preview` 會先產生資料並以 development-only 本機模式啟動 localhost:8081，不連線會員／雲端。正式 build 不可略過 Clerk 必要設定。
- 依變更執行 `npm run check`；改原生畫面時另驗證 `npm run verify:ios-bundle`。本機尚無可用的 iPhone Simulator，不把瀏覽器或 Hermes bundle 檢查稱為實機驗收。
- 詳見 `docs/LOCAL_PREVIEW.md`。此同步不新增功能公告，也不自動發布 TestFlight。

## 環境與發布接手

- 先讀 `docs/AGENT_SETUP.md` 的能力狀態及 `docs/RELEASE_RUNBOOK.md` 的操作範圍；本機帳號對應與待辦見受 Git／EAS 排除的 `.agent-local/setup-status.json`，不沿用其他電腦的 session 或驗收結果。
- 設定環境、接受邀請或加入既有測試群組，不代表獲准建立新 build 或發布版本。Apple 本人驗證完成後，只把本人加入既有 Core QA，保留原有外部測試資格。

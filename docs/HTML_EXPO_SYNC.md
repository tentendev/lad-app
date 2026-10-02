# 原始 HTML → Expo 同步（2026-09-17）

來源：`upstream/main` 的 `8507b78`，以原始 `index.html`、`schedule.js` 為本輪功能與視覺依據。

| 原始版更新 | Expo Web 實作 |
| --- | --- |
| 九月排期與官方來源 | 23 筆排期，更新日期 2026-09-15；匯出前自動由 `schedule.js` 產生 `src/data/schedule.ts` |
| 男主篩選收合、清除、簡化色彩 | 預設收合、中性色按鈕、摘要與清除全部；沿用既有保存，支援 `lad_leadFilter` 遷移 |
| 可編輯禮包包數 | 每階限購、按卡池保存、套用建議、合計實際金額／已知抽數／剩餘缺口、帶入錢包 |
| 收合禮包明細與累計價格 | 每階明細可收合，區別單包價格及買滿本階的累計價格 |
| 保底與抽數繼承提示 | 目標欄位旁的收合說明；持有資源與目標欄位對齊 |
| 6／12 個月及自訂統計 | 收合式統計、最多 60 月、自訂範圍驗證、總花費／月平均／最高月、圖表選月與鍵盤操作 |
| Safari 日期／月份控制 | 外層處理邊框與留白；窄寬度的月份輸入採單欄，保留完整日期 |
| 回饋問卷與確認文案 | 底部新增回饋入口、原生 modal dialog、焦點循環與關閉後復位，連向現行問卷 |
| 頁首緊湊化 | 原版標誌、標題及副標；會員入口保留於右上角 |

保留 Expo 既有多活動規劃、五星追蹤、會員、雲端備份、類別 CSV、行事曆匯出和離線功能。新的禮包選擇儲存於 calculator snapshot，會跟隨既有 JSON／雲端備份。統計期間屬裝置上的顯示偏好。

缺少結束日期的預測密約顯示「結束日待確認」。行事曆僅標記預測開啟日並附說明；不捏造結束日期。

## 後續同步

`npm run sync:expo-data` 可單獨同步排期。`npm run export:web` 會先自動同步；來源一致性測試會偵測手動更新後未同步的資料。上游官方抓取工作流程仍維持手動觸發。

## 驗證

- `npm run check`：ESLint、strict TypeScript、112 項 Vitest 與 6 項 Node 測試。
- `npm run export:web`、`npm run verify:web`：正式靜態輸出與離線預快取檢查。
- Ego Lite：原始 HTML 及實際 `dist/` 輸出的操作比對；禮包保存與 NT$75 記帳、篩選保存、自訂範圍錯誤與還原、圖表選月、問卷焦點與 Escape。
- 圖片與 QA 記錄位於 `artifacts/2026-09-17-expo-sync/`。
- 本輪為 Expo Web 同步；原生 iOS 畫面與商店發布另依後續排隊任務處理。

## 採用技能

UI Design：Build mode；`design-guidelines.md` 及 colors、buttons、badges、border-radius、dashboards、flexbox-layout、form-controls、general、headers、icons、materials、navigation、responsive-design、svg、shadows、surfaces、typography。既有專案與原版設計優先於通用樣式建議。

UI Audit：針對本輪變更的 form、list、dashboard、modal；檢查資料保留、錯誤／空白狀態、焦點與键盤操作、標籤、觸控範圍及響應式排版。瀏覽器操作使用 ego-browser。

已修正 390px 規劃／追蹤日期欄位超出父層的問題，320px／390px 複測通過。`ui-audit.json` 記錄本輪變更範圍的 9 項檢查；目前無未解決發現。Ego Lite 為 Chromium，Safari 原生渲染與完整輔助科技稽核未在本輪執行。

## 2026-10-03 原作同步與 iOS 更新

原作來源：`its-maggie/lad-app` 的 `main`，commit `521e7be`（2026-10-02）。採一般 Git merge，保留 Expo 原生版與本機已有的十個提交。唯一 merge conflict 是 Vercel 設定：保留 Expo 的輸出／安全規則，加入原作排期與公告檔案的重新驗證快取；原作自動部署限定在 Maggie Repo，避免 Expo fork 的 push 改寫 HTML 網站。

- 最新公告彈窗與鈴鐺入口：所有頁面共用一次已讀判斷，關閉記住 `lad_readSiteUpdates`；首次原生介紹結束後才顯示，避免同時呈現兩個 iOS modal。只顯示原作最新核准公告，不額外新增功能公告。
- 同步 24 筆排期與 2026-10-02 metadata，包括如若午夜無眠、於深空見證的周邊、祁煜復刻、半透明侵占復刻預測，以及祁煜八月日卡修正。
- 周邊色改為 `#b8df78`，與主線藍色區分。已結束排期使用實線，保留來源是否為預測的資料；不把原本的預測冒稱官方公告。
- 累抽里程碑返券僅折抵目標前剩餘抽數：50 抽返 5 券、目標 51 抽時只能用其中 1 張。所有池種、0–300 抽均對照原作 JS 計算，避免舊版在邊界低估資源缺口。
- `sync:expo-data` 同步排期及最新公告；來源一致性測試可偵測遺漏。Node 測試與 Vitest 使用各自 runner，涵蓋上游新公告測試。
- 更新 Expo SDK 57 相容 patch；Expo Doctor 21/21、ESLint、strict TypeScript、119 個 Vitest 與 9 個 Node 測試通過。相依套件審閱見 `DEPENDENCY_SECURITY_REVIEW.md`。

UI Design 使用 Build mode、design-guidelines 與 colors、buttons、badges、border-radius、flexbox-layout、general、headers、icons、materials、navigation、responsive-design、svg、shadows、surfaces、typography；以 Maggie 原作與既有原生無障礙規格為準。Web 以 ego-browser 驗證公告、Escape、焦點復位、已讀保存與 390px 寬度。原生迭代使用舊 simulator binary 嵌入本輪 Hermes bundle；這份證據與後續完整 EAS binary 的驗收分開記錄。證據位於 `artifacts/2026-10-03-expo-sync/`。

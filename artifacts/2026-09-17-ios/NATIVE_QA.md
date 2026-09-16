# Native QA — 2026-09-17

內部模擬器驗收，使用 development Clerk publishable key；没有連線到 production 雲端資料，也沒有提交 App Review。所有新增花費／預算／計數均為本次建立的模擬器測試資料。

## Device coverage

- iPhone 17 Pro Max / iOS 26.5：1320 × 2868，主要操作流程。
- iPhone 17e / iOS 26.5：1170 × 2532，較小螢幕、首次使用、頁首、表單與軟體數字鍵盤。
- iPad Pro 13-inch (M5) / iOS 26.5：2064 × 2752，介紹、排期、回饋、錢包與日期面板。

## Confirmed on installed app

| Path | Result |
| --- | --- |
| 首次使用與重新啟動 | 介紹頁完整顯示；開始後可進入排期；重啟不再次要求介紹 |
| 排期篩選 | 展開、清除全部後顯示空狀態、恢復全部正常 |
| 預算與新增花費 | NT$3,000 預算，新增 NT$150 後餘額 NT$2,850、使用 5% |
| 日期取消 | 9/17 改選 9/18 後取消，表單仍為 9/17 |
| 日期確認 | 改選 9/18 後完成，表單及已新增紀錄為 9/18 |
| 統計範圍 | 6 個月合計 NT$150、平均 NT$25；開始 12 月／結束 9 月會提示錯誤；改為 8–9 月後平均 NT$75 |
| 圖表與明細 | 點 8 月切換空紀錄，點 9 月回到 NT$150 明細 |
| 手動禮包 | 70 抽目標建議 NT$1,295；第四階由 1 改 0 後為 15 包／NT$975／45 抽／尚差 9 抽 |
| 禮包持久化 | 重新安裝同 bundle identifier 的測試版後，目標與 15 包仍保留 |
| 重複跨分頁帶入 | 先開錢包，再回換算加回第四階，NT$1,295 正確帶入已開啟錢包；確認後總支出 NT$1,445，餘額 NT$1,555 |
| 追蹤帶入換算 | 限定新池 +10 後保守目標 130 抽，已開啟換算頁收到 130 |
| 排期帶入規劃 | 已開啟換算頁收到「新混池5」、截止日 2026-10-04 與預測日期旗標 |
| iPad 介面 | 520pt 內容寬度、五分頁、日期面板置中；取消／完成可達 |
| 小螢幕 | 頁首保持單行；數字鍵盤出現時預算輸入仍可見；點表單標題可收起键盤 |

## Repairs discovered through actual use

- SafeAreaView 需明確 `style.flex=1`，否則首頁只有背景。
- 月曆事件文字需明確 line height，避免被 14pt 色條裁掉。
- 底部導覽高度納入 safe-area；VoiceOver 標籤明確為五個分頁。
- HeroUI 控制元件套用 App 色彩；錢包欄位加上常駐標籤。
- 原生分頁保留 mounted state；讀取資料改成 focus-aware effect，確保帶入／外部還原後重讀。Web 保持原本的 mount lifecycle。
- 新排期帶入時清除先前編輯 ID，避免誤更新另一個目標。

## Artifact provenance and limits

首個完整 EAS Simulator build：`8299a04f-d180-487f-a3f9-2007338f0140`（來源 `a396b8a`）。上述修正使用 Expo `export:embed --bytecode` 更新同一個 simulator native binary 進行快速迭代；不是 production archive。第二個 build `63070a5d-5308-4718-aada-ac6e94f498c9` 在最後尺寸修正時取消，完整最終重建另記錄於 release-status.json。

截圖直接由 Simulator 擷取，沒有生成或改造 App UI。`iphone-welcome.png` 是第一輪的舊按鈕配色，僅作初次啟動證據，不用於商店上架。

未涵蓋：production Google／Apple 登入、真實裝置、TestFlight、production 同步／帳號刪除、完整 VoiceOver 與 Dynamic Type 稽核、完整離線網路隔離。這些不能因單元測試或模擬器正常就標記完成。

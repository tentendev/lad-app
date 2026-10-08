# 深空省省 App Store 輪播圖提案

依擁有者要求，用 Ego Lite workspace `4` 瀏覽 Pinterest 看板。原始連結 `https://www.pinterest.com/tentenux/car-app/` 導向 [Spash Screen Design - Lad App](https://www.pinterest.com/tentenux/spash-screen-design-lad-app/)，共有 14 個參考。研究了編輯式字體、柔和 3D 小物、紫色手機展示與分頁構圖；Pin 圖片只作構圖研究，沒有加入 App 或上架素材。

已透過 **Higgsfield CLI** 完成五組提案，每組是一張五頁輪播總覽。生成配置全部核對為 `gpt_image_2_5`、resolved model `sunburst`、`high`、`2k`、`21:9`；原圖均為 **2688 × 1152 PNG**。這是每組的 2K 總覽，尚非五張個別 2K 上架截圖。原創星星口袋與現有原生截圖作為參考。

| 編號 | 方向 | 設計重點 | Pinterest 構圖參考 |
| --- | --- | --- | --- |
| 01 | 紫霧精品 | 珍珠白、紫霧、編輯式大字 | [Typography](https://www.pinterest.com/pin/157555686962669382/) |
| 02 | 星際微光 | 深紫星空、發光軌道、立體品牌物件 | [Floating mobile UI](https://www.pinterest.com/pin/157555686962669381/) |
| 03 | 奶油星球 | 柔和分頁色、圓潤大字、霧面 3D 小物；推薦方向 | [Social onboarding](https://www.pinterest.com/pin/157555686962669377/) |
| 04 | 大字鮮紫 | 紫白交錯、放大的手機與字體 | [Purple UI presentation](https://www.pinterest.com/pin/157555686953252609/) |
| 05 | 星光手帳 | 紙張、索引、拼貼與星星印記 | [Task onboarding](https://www.pinterest.com/pin/157555686962669392/) |

五頁故事依序為品牌、排期、預算、資源換算、紀錄與手動雲端備份。03 的分頁色與圓潤字體在縮圖仍清楚，適合 App 的親近感與現有紫色識別。

可互動比較頁位於 `assets/generated/app-store-concepts-2026-10-08/index.html`，同目錄包含五張原圖。比較頁可看整組、逐張放大、左右切換與標記方向；標記只存在本機，不會送審。桌面與 390px 手機版已開啟驗證，五張圖片均可載入，逐張切換至第 2、5 頁可正常顯示，手機預覽比例正確且沒有水平溢出。

提示詞、設計 brief、Pinterest 來源連結與整理過的 [generation receipt](generation-receipt.json) 均保留在本目錄。完整 CLI payload、研究圖片與驗證截圖保留在本機並忽略 Git。

**等待擁有者選定方向。** 目前未將提案上傳 App Store Connect，也未改 App 啟動畫面。選定後需套入最新版 build 6 的真實實機畫面、逐字校對與獨立排版，製作個別正式尺寸素材；不能直接把 AI 重繪的 UI 當成最終實機截圖。原本發布任務繼續保留，最後送審需先完成原生帳號刪除／實際 Apple 撤銷驗收及上架素材確認。

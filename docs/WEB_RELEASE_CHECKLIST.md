# Web 上線清單

## 本機單一發版閘門

執行：

```bash
npm ci
npm run release:web
```

`release:web` 必須同時通過 ESLint、strict TypeScript、Vitest、Expo Doctor、靜態輸出及輸出檔完整性／體積檢查。正式站輸出在 `dist/`。

本輪基準：104/104 tests、21/21 Expo Doctor、17 條靜態路由、29 個預快取 bundle、5.5 MiB 完整輸出；production cache ID 為 `ae48e6ce2e29`。

## 已納入程式的上線條件

- 公開產品／政策頁面：`/schedule`、`/wallet`、`/calculator`、`/tracker`、`/about`、`/account`、`/privacy`、`/support`，以及 authenticated `/api/sync` function。
- 根路徑重新導向 `/schedule`，未知路徑使用品牌化 404。
- PWA manifest、192／512px 圖示、Apple touch icon 與版本化離線快取。
- 路由獨立標題與描述、Open Graph 基本資訊、繁體中文語系。
- `robots.txt` 排除 Expo 內部 bundle、sitemap debug 頁與 route-group 輸出；正式網域確定後再加入 canonical 與 sitemap URL。
- CSP 已加入指定 Clerk FAPI、Protect、Cloudflare challenge、telemetry 與 avatar 來源；`nosniff`、referrer、permissions、frame 邊界維持不變。
- 本機優先；Clerk session、Neon snapshot、optimistic revision conflict、一般備份／交易式還原與帳號刪除均已有邊界驗證。
- 非官方工具、排期預測與 IP／隱私說明。
- Production 預設不渲染內部 Debug launcher；若驗收環境需使用，必須明確設定 `EXPO_PUBLIC_ENABLE_DEBUG_TOOLS=true`，不可沿用到正式環境。

## 部署後人工驗收

1. 確認 `/` 重新導向 `/schedule`，所有公開產品／政策頁、`/api/sync` 未登入 401 與任一不存在網址回傳正確狀態。
2. 用全新瀏覽器完成：設定 NT$3,000 預算 → 新增 NT$170 → 換算 40 抽 → 把建議帶入錢包 → 重新整理。
3. 確認排期五位男主篩選、月份切換、日期選取、預測虛線、單筆行事曆與目前顯示範圍匯出都可操作。
4. 安裝 PWA 後離線重開 `/wallet`、`/calculator`、`/tracker`、`/about` 與尚未造訪過的 `/account`；會員頁應直接顯示本機功能仍可使用，登入／雲端動作則停用或顯示可理解的離線訊息。
5. 在 320px、390px、520px 和桌面寬度確認無水平捲動或底部內容遮擋。
6. 確認正式網址的 `/about` 可公開存取；此頁亦作為 iOS 隱私政策候選網址。
7. 跑正式網址的 Lighthouse 與 axe；若輸出 fingerprint 與本次不同，保留新報告。

## Vercel promotion 前置閘門

本機已連結至擁有者帳號下的 `tentenco/lad-pocket`；`.vercel/project.json` 與 Vercel OIDC 檔案均被 gitignore，不得提交或貼入 issue／聊天。部署前先執行：

```bash
npm run release:web
vercel build --yes --scope tentenco
npm run verify:vercel-prebuilt
npm run preflight:web-deploy
```

`vercel build` 只會在 `.vercel/output` 建立本機 Build Output API artifact；後兩個命令會逐檔比較該 artifact、核對 linked project 與既有 production alias，不會建立部署。取得明確部署授權後，以 `vercel deploy --prebuilt --archive=tgz --scope tentenco` 建立 preview 並完成本文件的人工驗收；只有 preview fingerprint 與本機收據一致時，才可 promotion 到 production。

取得 preview URL 後先執行 `npm run verify:web-deployment -- https://PREVIEW_URL`。這個 gate 會拒絕 build ID 不一致、錯誤 redirect／404、缺少安全 headers 或錯誤 cache policy 的部署。

## 尚未由本機工作取代的外部步驟

- 建立／連結正式 Vercel project 與網域。
- 由擁有者確認正式產品名稱、網域與法律文字。
- 部署後 DNS、憑證、快取 header 與真實 404 狀態驗證。
- 雲端同步、裝置分享／複製與 CSV／ICS 匯出已完成；可公開存取的 hosted plan link 仍不在本次範圍。
- `npm audit --omit=dev` 目前為 0 critical、22 high、18 moderate affected dependency entries；根因仍收斂到已審閱的 `image-size` parser 與 `uuid` advisory。npm 建議的自動修復會造成不相容的 Expo／Reanimated 變更，需等待上游相容更新後重驗。

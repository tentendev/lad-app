# 深空省省

抽卡課金規劃工具，支援《戀與深空》的排期、預算、資源換算、多活動規劃與五星追蹤。專案以 Expo Router 建置 Web、iOS 與 Android 共用的 domain logic；Web 與未簽名 iOS bundle 均已有完整 release gate，正式簽名與商店驗收仍需擁有者平台資料。

## Web 現況

- `/schedule`：月曆排期、保留男主篩選、官方／預測狀態、帶入規劃，以及單筆或目前顯示範圍的 RFC 5545 `.ics` 行事曆匯出。
- `/wallet`：按月預算、花費新增／編輯／刪除復原、警示門檻、類別占比、上月比較、六個月趨勢、月底預估、每日彈性支出／預估差額，以及類別範圍 CSV 匯出。
- `/calculator`：鑽石、金券、官方返券、預留資源與禮包階梯換算，可帶入錢包；也能建立多活動抽卡規劃、切換情境、分享摘要、估算逐活動補足禮包或單輪限購可補上限，依截止日與每月存鑽預測全程缺口，並用每日資源進度校正預測。
- `/tracker`：手動維護限定新池、復刻池與常駐池目前累計，提供 −1／+1／+10 快速調整、手動保證校正與 70/140 抽目標 handoff，保存五星抽數／結果／思念名稱，並提供單池線統計與 CSV 匯出。
- `/about`：非官方定位、IP 免責、資料與隱私說明、本機 JSON 備份／還原（含排期男主篩選）與損壞資料救援檔。
- `/account`：Clerk Email／密碼註冊與登入、Email 驗證、Google／原生 Apple 登入、個人資料與密碼管理、Neon 私人備份、衝突保護、離線狀態／重連恢復、登出、單獨刪除雲端備份與永久帳號刪除。
- `/privacy`：App Store 可公開讀取的完整隱私政策、資料保留與刪除說明。
- `/support`：App Store 支援網址、問題回報指引與會員／隱私入口。
- PWA：安裝圖示、離線 app shell、五個主要工具路由、會員頁與分割 bundle 預快取。

Web 視覺以原始 `lad-pocket.vercel.app` 版本為準：520px 單欄、薰衣草星空背景、半透明玻璃卡、原版活動色票與固定底部導覽。專案不使用遊戲美術、角色立繪、卡面或官方標誌。

## 資料與隱私

資料採本機優先：未登入時，預算、花費、換算設定、抽卡規劃與五星紀錄只儲存在使用者的瀏覽器或裝置。登入後可明確選擇將完整 snapshot 上傳至 Neon，或把雲端版本下載到目前裝置；revision 不一致時 API 會拒絕覆寫。Clerk 負責會員與 session，Neon 連線只存在 Vercel server function。沒有廣告 SDK、跨 App tracking 或資料公開功能。

Web 沿用並遷移舊版 `lad_*` localStorage keys：

- `lad_budget` / `lad_budgets`
- `lad_expenses`
- `lad_calc`
- `lad_planner`
- `lad_wish_tracker`
- `lad_schedule_preferences`

舊類別「抽卡」「禮包」「月卡」會在載入時轉成目前名稱。根目錄的 `index.html`、`packs.js` 保留作為原始版參考；`schedule.js` 是排期資料來源，`npm run export:web` 會自動產生 Expo 對應資料。2026-09-17 功能與設計同步詳見 `docs/HTML_EXPO_SYNC.md`。

## 開發與驗證

需求：Node.js 22.13 或更新版本。

```bash
npm install
npm run web
```

品質與正式輸出：

```bash
npm run check
npm run doctor
npm run export:web
npm run verify:web
npm run verify:vercel-prebuilt
npm run preflight:web-deploy
npm run verify:web-deployment -- https://PREVIEW_URL
npm run verify:ios-bundle
npm run preflight:ios-build
npm run preflight:ios-submit
npm run security:audit
npm run release:ios:validate
npm run db:migrate
npm run smoke:cloud -- https://PREVIEW_URL
npx serve dist
```

`npm run release:web` 是正式 Web 單一閘門，會執行 ESLint、strict TypeScript、Vitest、Expo Doctor、靜態輸出與 release artifact 驗證。`npm run verify:ios-bundle` 會在暫存目錄輸出並檢查 Hermes iOS bundle，不會生成或污染工作樹裡的原生專案。

`verify:vercel-prebuilt` 會逐檔比較 `.vercel/output/static` 與 `dist/`，並核對 Vercel Build Output API 的 redirect、404、安全與 cache 規則。`smoke:cloud` 會建立短暫 Clerk 測試會員，驗證 Neon create／conflict／read／snapshot delete 與永久帳號刪除 API。`preflight:ios-build` 會核對 bundle identifier、Sign in with Apple entitlement、privacy manifest、加密、SDK image 與版本策略；`preflight:ios-submit` 另檢查 production Clerk／Apple／Neon、已輪替密鑰、內容權利、Expo／App Store ID 與公開端點。`security:audit` 只接受已審閱且記錄在 `docs/DEPENDENCY_SECURITY_REVIEW.md` 的上游 advisory。

取得 preview URL 後，`verify:web-deployment` 會以本機 build ID 為權威，核對遠端公開產品／政策頁、sync API 401 boundary、307 redirect、404、CSP、安全 headers、service worker 與 immutable asset cache；通過前不可 promotion。

## Renderer 與結構

- Web：HeroUI React v3 元件級匯入，搭配原版專用 CSS skin 與免下載的系統襯線字體 fallback。
- iOS / Android：HeroUI Native、Uniwind。
- 共用：預算、排期、抽卡換算、官方返券、禮包推薦與 storage repository。

```text
src/
├── app/                  Expo Router routes 與平台 layout
├── auth/                 Clerk provider、Email／密碼與 Google／Apple custom flow
├── data/                 禮包、排期、storage repository 與 cloud client
├── domain/               純 TypeScript 計算、驗證與格式化邏輯
├── features/             wallet、schedule、calculator、wish tracker renderer
└── ui/                   平台 page shell
scripts/                  release build scripts
test/                     domain regression tests
```

## 發佈邊界

`vercel.json` 已設定 `npm run export:web`、`dist/` output、乾淨路徑、靜態資產快取與基本安全 headers。這個工作樹尚未替使用者 commit、push 或部署。

iOS 已具備 Expo Router、HeroUI Native、Clerk SecureStore session、原生 Sign in with Apple、server-side account deletion／Apple revoke、公開隱私／支援路由、資料清冊與 App Store Review 草稿；上架前仍需由擁有者提供法律資料、確認內容權利、連結 Expo／Apple Developer Team、完成 production 平台設定，並完成實機 OAuth、TestFlight 與商店資料驗收。詳見 `docs/IOS_RELEASE_PREPARATION.md`、`docs/APP_STORE_REVIEW_PACKAGE.md` 與 `docs/LEGAL_RELEASE_INPUTS.md`。

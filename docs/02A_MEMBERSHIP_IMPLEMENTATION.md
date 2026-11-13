# 02A 改版與會員系統

介面已於 2026-11-13 依指定參考圖再次修正，最新畫面及驗證見 [參考圖重合紀錄](02A_REFERENCE_FIDELITY.md)。下文保留 11 月 12 日的會員實作與連線待辦。

日期：2026-11-12。工作範圍只包含 Expo App（原生與 App Web），HTML 網頁版維持現況。排期、公告與禮包來源沒有本次內容變更；匯出時執行資料產生器，產生檔沒有差異。

## 改版前備份

- 原始碼提交：`0d62224`。
- Git 分支：`backup/20261112-before-02a-membership`。
- ZIP、原畫面及還原說明：父資料夾 `備份/App-2026-11-12-改版前/`。ZIP 已通過完整性檢查，不包含 `.env.local` 或個人帳號資料。
- 既有未追蹤 UI 提案資料夾保留原樣；只將選定的 02A 圖像另複製到本次成果資料夾，沒有把全部研究素材加入程式碼。

## 本次行為

### 02A 霧光星軌・原版

珍珠白、淡紫、冰藍與深梅色文字套用到錢包、排期、換算、追蹤、會員、管理後台、說明頁、日期／選單與通知彈窗。錢包改為環形預算，加入原創 SVG 星軌，原生保留系統日期、Dynamic Type 與鍵盤避讓。選定樣式與實作畫面見 [成果與參考](../artifacts/2026-11-12-02a-implementation/README.md)，設計 token 見 [設計基準](DESIGN_SYSTEM.md)。

### 活動池選單

換算與新活動規劃不再提供「協會補給」「其他」，保留日卡、混池、月卡、生日與三種復刻，共七種。舊備份仍能讀取；舊換算若選中停用項目，回到日卡池，持有資源與目標抽數保留。既有歷史規劃不刪除；編輯停用類型的目標時，表單預設回日卡池供重新確認。記帳類別的「其他」仍保留。

### 會員前端與後端

沿用 Clerk／Neon，保留既有 Email 註冊、驗證碼、新裝置驗證、登入、忘記密碼、修改資料／密碼、Apple 登入、登出、私人備份與帳號刪除。此次修正與補強：

- 登入不再套用註冊的 15 碼最短長度，仍由驗證服務核對既有密碼；註冊及重設保留原密碼要求。
- 會員雲端狀態以帳號歸屬隔離；帳號切換後不顯示前一帳號的 snapshot，取得 token 後再次確認身分。
- 未取得雲端狀態時，不能上傳並假設雲端為空。下載前重新讀取，避免還原過期內容。
- 雲端更新使用嚴格版本檢查；舊版本不能在備份已刪除時自行重建。
- 雲端 API 查核會員是否仍存在與已停權，避免僅靠尚未過期的 JWT 放行。

## 會員管理介面

使用者已確認需要管理介面。Web 與原生均提供 `/admin`，且管理者可從會員中心進入。

- 以 Email、姓名或 Clerk user ID 搜尋，伺服器每頁最多 20 位。
- 查看名稱、Email 與驗證狀態、加入時間、最近登入、停權狀態、備份版本與更新時間。
- 不提供預算、花費、換算或抽卡紀錄明細的查閱／匯出。
- 停權與恢復需確認對象，並填寫 2–240 字原因。自己與其他管理者不能從此介面停權。
- 操作前先寫入 `lad_member_audit`，再呼叫 Clerk；紀錄顯示待確認、完成或失敗。若動作已完成、最終紀錄更新失敗，回應明確保留待確認狀態，避免誤報動作失敗並鼓勵重試。

### API 與資料

| API | 身分與功能 |
| --- | --- |
| `GET /api/member` | 回傳本人 ID 與伺服器判定的管理權限 |
| `GET /api/admin?search=&offset=0` | 管理者查詢會員清單、備份 metadata 與最近 20 筆管理紀錄 |
| `POST /api/admin` | 管理者停權／恢復，驗證動作、對象及原因 |
| `GET/PUT/DELETE /api/sync` | 僅本人 snapshot；查核會員狀態與版本衝突 |
| `DELETE /api/account` | 本人帳號、備份與 Apple 撤銷流程 |

所有管理與會員回應使用 `private, no-store`，service worker 不快取 API 回應。搜尋、分頁與 SQL 皆有輸入限制；SQL 使用參數，不能由 client 指定其他會員的備份。

管理權限只接受伺服器 `MEMBER_ADMIN_USER_IDS`（逗號分隔 Clerk user IDs），或 Clerk 的 `privateMetadata.ladRole = "admin"`。不使用客戶端可寫的 `unsafeMetadata`，不以 Email 比對，也不自動將第一位註冊者升成管理者。角色設定留在受權限保護的服務端。

資料庫新增 `sql/002_member_audit.sql`；`npm run db:migrate` 會依序執行目前所有冪等 migration。部署管理後台之前，需在正確環境執行 schema migration。

## 真實服務連線待辦

本次只讀核對 App 專用 Vercel project `tentenco/deep-space-ledger-app`，ID `prj_2O9QRjrN5IiXeoe2XqwS3OghyybU`。平台目前的 14 個環境變數都只套用 production，沒有可供此次驗收的 preview server 設定。現有 `.env.local` 只有既有 Clerk 測試公開值與營運公開資料；未下載正式 server secrets，也未修改 production。

瀏覽器的 GitHub OAuth 顯示 `tentendev`，與本次本人 `its-maggie` 不同，因此取消授權，未借用該帳號。Maggie 已確認有權限並指定使用本人帳號；透過 Google 成功登入 `maggie@tenten.co`，但 Clerk 目前只顯示空的「Maggie's Organization」。信箱中找到 6 月 5 日的 Personal workspace 邀請，開啟後仍未新增組織或 App。已請本人確認獲邀 Email，尚無現有 Clerk instance 或 Neon 測試資料庫的有效管理權限證據。

Vercel 在此只承載 App 的 API 與 App Web 預覽，不是原作 HTML 網頁版。這兩個專案獨立；測試設定只應套用 App 的 development／preview，不修改 `lad-pocket.vercel.app`。

要完成實際連線驗收，使用本人或獲授權管理者在服務平台設定：

1. 同一個 Clerk 測試 instance 的 publishable key 與 server secret；開啟 Email／密碼與 Email 驗證。Apple 登入另依既有設定及原生裝置驗證。
2. 獨立測試資料庫的 `DATABASE_URL`，不將正式資料庫連到 preview；執行 `npm run db:migrate`。
3. 在測試後端指定本人的管理者 ID 或私有角色，並核對預覽網址的 authorized parties。原生測試還需指向相同測試 API。
4. 以兩個測試會員和一個管理者實測註冊、驗證、登入、重設、本人備份、跨帳號拒絕、停權／恢復、角色拒絕及刪帳；只操作明確建立的測試資料。

不要把 secret 貼進對話或 `EXPO_PUBLIC_*`。本人權限／測試環境尚未確認時，真實服務與手機驗收保持待辦，不能以單元測試或匯出成功代替。

## 驗證證據

- `npm run check`：ESLint、TypeScript、15 項 Node 與 221 項 Vitest 測試通過。新增驗證涵蓋簽章／來源、角色、停權、唯一本人備份、版本衝突、參數限制、操作紀錄、停用卡池的舊版帶入與 client 回應格式。
- 最終 iOS Hermes 匯出通過，8.4 MiB；沒有建立 EAS build 或上傳 TestFlight。
- 最終 App Web 匯出與 release artifact 檢查通過：24 個必要檔案、33 個 precache bundles，5.6 MiB，build ID `35ed7e38ace9`。包含 `/admin` 與星軌離線素材；尚未執行 Vercel prebuilt runtime 檢查或部署。
- 瀏覽器以獨立 `127.0.0.1:8081` origin 操作測試；原 `localhost:8081` 的玩家資料未修改。已驗證預算／花費重新載入保存，以及五星紀錄、25 抽累計與保證校正帶入 45 抽目標。此資料為介面驗證示意。
- 原生實機、Apple 授權、真實註冊／備份／會員管理尚未驗收。沒有更動 HTML production、正式 App Web／API 或商店版本。

官方參考：[Clerk 自訂 Email／密碼流程](https://clerk.com/docs/guides/development/custom-flows/authentication/email-password)、[使用者分頁與搜尋](https://clerk.com/docs/reference/backend/user/get-user-list)、[伺服器 metadata](https://clerk.com/docs/guides/users/extending)。呼叫形狀同時核對目前安裝的 `@clerk/expo` 與 `@clerk/backend` TypeScript 定義。

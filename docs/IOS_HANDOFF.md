# iOS 封裝交接

2026-10-03 已同步 Maggie 10/2 設計並完成新版 iPhone／iPad build 與驗收。TestFlight 1.0.0 (4) 已進入 `IN_BETA_TESTING`；詳見 [發布紀錄](../artifacts/2026-10-03-expo-sync/RELEASE.md)、[QA 紀錄](../artifacts/2026-10-03-expo-sync/QA.md) 及 [Review 套件](APP_STORE_REVIEW_PACKAGE.md)。下文保留 9/17 封裝交接歷史；正式 App Review 尚未提交，不能把 TestFlight UI build 當作正式環境驗收完成。

## App 基礎

- 原生五分頁：錢包、排期、換算、追蹤、回饋；共用 domain logic，HeroUI Native／Uniwind。
- 原版薰衣草星空與活動色；首次使用介紹、生成品牌 icon、原生日期選擇器與鍵盤避讓。
- AsyncStorage、寫入失敗提示、刪除復原、跨頁 handoff、JSON 備份／交易式還原／原始救援檔。
- 實際禮包數量與花費、持久化篩選、6／12／自訂月份統計與月明細切換。
- Clerk／SecureStore、Email／密碼、Google／Apple 登入、會員管理、雲端備份與 App 內帳號刪除的程式已存在；production 設定與端到端驗證仍待完成。
- App privacy manifest 宣告八類可能收集資料、no tracking；商店表單需以 production 實際行為填寫。
- EAS simulator／preview／production profiles 固定 SDK 57 image；production 遠端遞增版本，要求已提交 Git 的程式碼。

## 本次驗證與限制

120 個自動測試、lint、TypeScript、Doctor 21/21、Web export、Hermes 8.5 MiB 與 build preflight 通過。CocoaPods／Clerk SPM 的 UUID 衝突已修復並能解析 Xcode workspace。本機 clang probe 仍出現 build service pipe 等待，改走 EAS Simulator build；首個 EAS Simulator build 已完成安裝，並在實際 QA 修正首頁高度、月曆文字及跨分頁帶入問題。操作證據與截圖位於 `artifacts/2026-09-17-ios/`；最終 EAS build `6cfea0da-e23d-4a40-9da9-a63cc44f5fcf` 已完成，未修改產物已安裝至三款模擬器並做主流程檢查。完整送審驗收仍待正式服務及實機／TestFlight。

正式服務尚缺 Clerk production、Apple OAuth server key、Vercel production env／公開端點、營運與審核聯絡資料、內容使用權確認。不得使用 development credentials 建立送審版，也不得把未完成事項的 preflight 旗標設為已完成。

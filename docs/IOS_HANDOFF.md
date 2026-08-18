# iOS 封裝交接

## 已完成的原生基礎

- Expo Router 原生四分頁（錢包、排期、換算、追蹤）、HeroUI Native／Uniwind renderer 與共用 domain logic。
- 原版薰衣草星空、玻璃卡、男主色、活動色、月曆跨日色條與底部導覽。
- AsyncStorage 本機資料、寫入失敗提示、刪除復原、跨頁 handoff，以及含排期男主篩選的可分享 JSON 備份／交易式還原／原始救援檔。
- Clerk Expo provider、SecureStore session、Email／密碼註冊與登入、Email 驗證、Google SSO、原生 Sign in with Apple、自訂 HeroUI Native 會員中心、個人資料與密碼管理、單獨刪除雲端備份，以及 server-side in-app account deletion／Apple token revoke。
- Neon 雲端備份 client；原生未另行指定時使用 `https://lad-pocket.vercel.app/api/sync`。
- App icon 1024px、portrait、dark style、URL scheme 與 `ITSAppUsesNonExemptEncryption=false`。
- 原版薰衣草 `#7765a7` 啟動畫面與中性白色鑽石圖形；隔離 prebuild 已核對 1x／2x／3x 透明素材與 132pt 寬度。
- App 層已宣告 name、email address、user ID、device ID、other diagnostic data、customer support，以及使用者主動雲端備份的 other financial info／other user content；linked、供 app functionality／安全防詐且不追蹤。React Native、Expo 與 AsyncStorage 套件均附必要 API 的 privacy manifest。
- `npm run release:ios:validate` 已通過 104/104 tests、`expo-doctor` 21/21、production dependency audit、Hermes export 與 build preflight；iOS bundle 已成功產生並通過 10 MiB 上限檢查（本輪基準 8.3 MiB）。
- 隔離 Expo prebuild 已確認 Sign in with Apple entitlement、8 類資料的 `PrivacyInfo.xcprivacy`、no tracking 與 `ITSAppUsesNonExemptEncryption=false`。
- 已加入 `eas.json` 的 `ios-simulator`、內部 `preview` 與 App Store `production` profiles；EAS 僅接受已 commit 的 source，production 使用 remote version source 並自動遞增 build number。
- `npm run preflight:ios-build` 會在 bundle identifier 缺失、placeholder、解析結果不一致或隱私／加密宣告漂移時中止，且不會啟動付費 build 或提交。
- EAS iOS profiles 已固定使用 Expo SDK 57 image，以符合 2026 年 iOS 26 SDK 上傳要求；`npm run preflight:ios-submit` 另檢查 EAS／App Store ID、Clerk production、Apple 登入、公開政策／支援頁與同步 API。
- 已加入 `/privacy`、`/support` 及 `store.config.json` 繁體中文 metadata 草稿。

## 需要擁有者決定或提供

1. 確認目前技術 identifier `com.tenten.deepspaceledger` 是否屬於正確擁有者；若否，需在第一次簽名 build 前修改。
2. Apple Developer Team、Expo project 與 App Store Connect app record。
3. 是否維持 iPad 支援。現在 `supportsTablet=true`；若保留，需要 iPad 實機／模擬器驗收與商店截圖。
4. 公開營運者／法律實體名稱、支援 Email、版權名稱與審核聯絡資料。
5. 玩家自製工具的商標、遊戲名稱、排期內容與免責文字之最終法律確認。

## 取得帳號資料後的順序

1. 核准或修改 `app.json` 的 bundle identifier，執行 `npm run preflight:ios-build`；build number 已由 EAS remote version source 管理。
2. 連結 Expo project 與 Apple credentials，在 EAS preview／production environment 設定 `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`、`EXPO_PUBLIC_ENABLE_APPLE_SIGN_IN`、`EXPO_PUBLIC_LEGAL_ENTITY_NAME`、`EXPO_PUBLIC_SUPPORT_EMAIL` 與 `EXPO_PUBLIC_SYNC_API_URL`，核對既有 build profiles。
3. 安裝 iOS Simulator runtime，完成小尺寸 iPhone、大尺寸 iPhone，必要時 iPad 的視覺與 VoiceOver 驗收。
4. 在實機測試 Google callback、原生 Apple 登入、session 重啟持久化、雲端上傳／下載／衝突／單獨刪除、永久帳號刪除／Apple revoke、日期輸入、刪除復原、離線啟動與移除 App 後資料行為。
5. 建置簽名的 preview，再建立 production archive；以 Xcode Organizer 或 EAS Submit 上傳 TestFlight。
6. 依 `docs/PRIVACY_DATA_INVENTORY.md` 完成 App Privacy 問卷；目前沒有 tracking、分析或廣告 SDK。
7. 準備商店截圖與審核備註，TestFlight 驗收後再送審。

目前這台機器已安裝 Xcode 26.6，但沒有可用的 Simulator device runtime；本輪已驗證 bundle 輸出，不能誠實宣稱已完成模擬器或實機驗收。最後一次 `npm run preflight:ios-submit` 依設計停止在 23 項擁有者／外部條件，沒有啟動 build 或提交；完整輸入、正式服務設定與順序見 `docs/IOS_RELEASE_PREPARATION.md`。

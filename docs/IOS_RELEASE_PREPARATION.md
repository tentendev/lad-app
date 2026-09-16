# iOS 上架準備（2026-09-17）

## 目前狀態

尚未提交 App Review，也尚未上傳 TestFlight。使用者已授權完成 App、建置及送審；以下缺口是實際資料、服務設定與驗收，不是等待再次批准送審。

- Apple Developer：`dev@tenten.co`，Team `RTK85AV2H2`。
- 已註冊 App ID `com.tenten.deepspaceledger`，啟用 Sign in with Apple。
- 已建立 [App Store Connect「深空省省」](https://appstoreconnect.apple.com/apps/6812909987/distribution)：Apple ID `6812909987`、繁體中文、SKU `deep-space-ledger-ios`；狀態為 Prepare for Submission。
- 已連結 [EAS @tentenco/deep-space-ledger](https://expo.dev/accounts/tentenco/projects/deep-space-ledger)：project `46cd6a19-3d6a-4b81-b08b-a531cb15664f`。
- 保留 iPhone／iPad 支援、免費、無廣告、無 IAP；商店設定草稿採手動發布。

## 本次已完成

原始 HTML 更新已同步 Expo Web 並推送 GitHub `fd3b1a8`。原生版追加相同的排期篩選、實際禮包數量／成本、帶入錢包、6／12／自訂月份統計、第五個回饋分頁與精簡品牌頁首；日期改用原生選擇器，保留取消／確認行為。

Logo 與首次使用介紹圖使用本機 Higgsfield CLI、`gpt_image_2_5`／`flare`、`medium`／`2k` 生成。原圖、提示詞、工作收據與衍生尺寸記錄位於 `assets/generated/ios-launch/`。已查看兩張原圖；1024px icon 不透明、無文字與第三方商標。介紹頁說明免登入、本機紀錄及主動選擇雲端備份。

Expo SDK 更新至 57.0.23、React Native 0.86.3 與相容套件版本。URI 解碼 DoS 修補與其餘依賴風險依 `DEPENDENCY_SECURITY_REVIEW.md` 記錄，沒有直接忽略整個 audit。

本次驗證：114 個 Vitest 與 6 個 Node 測試通過，lint／TypeScript 通過，Expo Doctor 21/21，Web export／verify 通過，iOS Hermes export 8.5 MiB（上限 10 MiB），基礎 build preflight 通過。安全閘門有 4 個已審查根 advisory、0 個未審查 advisory；不代表依賴完全沒有公告。

## 原生建置與驗收

本機 Xcode 26.6、CocoaPods 1.17.0 與 iOS 26.5 Simulator runtime 已就緒。已完成 Expo prebuild、110 個 Pods 安裝及 Clerk Swift Package 解析。

CocoaPods UUID 衝突曾令 `PBXProject` 被 `ClerkKitUI` 物件覆蓋。`plugins/withStablePodsProject.js` 在產生 Podfile 時加入避免重用既有 UUID 的修補；重新安裝 Pods 後已確認 root object 與 SPM dependency 分離、Xcode 可讀取 workspace。

本機 Xcode build service 仍在 clang metadata probe 階段停住；抽樣顯示 clang 等待輸出 pipe，而相同命令獨立執行成功。已停止本次卡住的程序；改用 EAS Simulator build 進行後續安裝與驗收。首個 EAS Simulator build `8299a04f-d180-487f-a3f9-2007338f0140` 已完成並安裝。實際操作找到並修正安全區域高度導致首頁空白、月曆文字裁切、原生分頁保留時未重新載入帶入資料等問題；修正版已用相同 native binary 重新嵌入 Hermes bundle 做內部 QA，後續仍需由修正 commit 重建完整 EAS artifact。

## 尚需完成的正式條件

已在 iPhone 17 Pro Max 驗證：首次使用、排期篩選、預算／花費加總、日期取消及確認、自訂期間錯誤提示／平均值／點月切換、手動禮包計算與再次帶入已開啟錢包、追蹤目標帶入、排期名稱／日期帶入已開啟規劃。iPad Pro 13 吋的介紹與首頁排版已查看。iPhone 17e 的介紹／單行頁首／軟體數字鍵盤與 iPad 置中日期面板也已查看並測試；尚未宣稱 production 登入或雲端驗收完成。

1. 公開營運者／版權名稱、支援 Email、App Review 聯絡人的姓名／電話／Email，以及第三方遊戲內容的使用權依據。不能代填未確認的法律聲明。
2. Clerk production instance、正式網域、Native application、Google OAuth、Apple connection／Hide My Email 與 deep link callback。現有 `.env.local` 是 development instance。
3. 輪替先前暴露的 Clerk／Neon credentials。私鑰與資料庫密碼僅存服務端，不能加入 Expo 公開環境或 Git。
4. Vercel production environment 與公開部署。目前 `/privacy`、`/support`、`/account` 及 API 均為 404；production environment 尚未設定。
5. Apple Services ID／Sign in with Apple key 與 server revoke 設定；EAS production 僅使用公開的 `pk_live_`、營運資訊、API origin 與功能旗標。
6. iPhone 大小尺寸及 13 吋 iPad 的實際安裝、操作、離線啟動與截圖；登入／同步／衝突／刪除帳號需在 production 服務及實機或 TestFlight 驗證。
7. App Store metadata、年齡分級、Content Rights、App Privacy、DSA（如適用）、Free／territories、審核用 production demo 帳號及聯絡資料。
8. 建立 production archive、上傳 TestFlight、驗收、選擇 build，最後送出 App Review。TestFlight 上傳不等於已送審。

## 驗證命令

- `npm run release:ios:validate`：程式、依賴、Hermes bundle、基礎設定。
- `npm run preflight:ios-submit`：正式設定及公開端點；目前應失敗，不可把確認旗標設為 true 來跳過工作。
- `eas build --platform ios --profile ios-simulator`：內部模擬器驗收，不可送 App Store。
- `eas build --platform ios --profile preview`：內部裝置驗收。
- `eas build --platform ios --profile production`：完成正式條件後才建立上架版本。
- `eas submit --platform ios --profile production`：上傳完成後仍需在 App Store Connect 送審。

相關資料：`PRODUCTION_ENVIRONMENT.md`、`PRIVACY_DATA_INVENTORY.md`、`APP_STORE_REVIEW_PACKAGE.md`、`OPERATIONS_RUNBOOK.md`。

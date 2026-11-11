# Maggie 開發與 TestFlight 快速開始

先接受 Expo、Apple 與 GitHub 邀請，再在自己的電腦執行下方指令。iOS 安裝包由 EAS 雲端建置；只做 Web 預覽及上傳 TestFlight，不需要先安裝 Xcode。

## 1. 接受邀請

| 平台 | 使用方式 |
| --- | --- |
| Expo | 用 `maggie@tenten.co` 註冊或登入，接受 `tentenco` 的 Developer 邀請。 |
| App Store Connect | 開啟寄到 `maggie@tenten.co` 的最新 Apple 邀請，用自己的 Apple Account 接受。權限是「深空省省」的 App Manager。若沒有 Apple Account，依 Apple 畫面建立並完成雙重認證。 |
| GitHub | 用原作帳號 `its-maggie` 接受 `tentendev/lad-app` 的協作者邀請，取得寫入權限。 |
| TestFlight | iPhone 安裝 [TestFlight](https://apps.apple.com/app/testflight/id899247664)，從 `maggie@tenten.co` 收到的測試邀請開啟 App。這封與開發權限邀請是不同的信。 |

Expo 專案：[tentenco/deep-space-ledger](https://expo.dev/accounts/tentenco/projects/deep-space-ledger)

App 管理：[深空省省 App Store Connect](https://appstoreconnect.apple.com/apps/6812909987/distribution)

程式碼：[tentendev/lad-app](https://github.com/tentendev/lad-app)。Build 8 的來源是 `7dd676444e204dc51af0e5f71371d5d19e19817c`，已同步到 `main`。

## 2. 第一次在電腦啟動

安裝 [Node.js 22](https://nodejs.org/en/download)（至少 22.13）與 Git，再開啟終端：

```bash
git clone https://github.com/tentendev/lad-app.git lad-app-expo
cd lad-app-expo
node --version
npm ci
npx eas-cli@27.7.2 login
npx eas-cli@27.7.2 whoami
npx eas-cli@27.7.2 project:info
npx eas-cli@27.7.2 env:pull --environment preview --path .env.local --non-interactive
npm run web
```

EAS 請登入 Maggie 自己的 Expo 帳號。`project:info` 應顯示 `@tentenco/deep-space-ledger`；若權限不足，先確認邀請已接受。瀏覽器預覽網址通常是 [http://localhost:8081/schedule](http://localhost:8081/schedule)，以終端印出的埠號為準。停止預覽按 `Ctrl+C`。

`.env.local` 由 Expo 拉取，目前 preview 包含 Clerk 測試用公開金鑰與公開營運資訊。排期、錢包、換算、追蹤可先做本機測試；preview 登入使用測試帳號，正式雲端備份與 Apple 登入請在 production TestFlight 驗證。preview 的金鑰與正式 API 不屬於同一個登入環境。

修改畫面主要看 `src/features/`、`src/ui/` 與 `src/app/`。`.native.tsx` 是 iOS／Android 版，`.web.tsx` 是 Web 版；修改其中一版後，另一版需要另外檢查。

## 3. 修改後上傳 TestFlight

先建立工作分支：

```bash
git switch -c maggie/my-change
```

完成修改後，將 `app.json` 的 `expo.version` 改為下一個版本。目前 1.0.0（Build 8）已是 `Ready for Distribution`，下一版可從 1.0.1 開始；不要只修改 `package.json`。Build number 由 EAS 自動遞增。

```bash
npm run sync:expo-data
npm run release:ios:validate
git status --short
```

檢查變更清單，只加入本次修改的檔案，再 commit 與 push。可使用 Git GUI；終端範例如下，檔名請換成本次實際修改的檔案：

```bash
git add app.json src/ui/NativePage.tsx
git commit -m "Update native layout"
git push -u origin HEAD
npx eas-cli@27.7.2 build --platform ios --profile production --non-interactive --freeze-credentials
```

這裡使用 EAS 已存的簽署憑證與 production 環境。若出現憑證失效或 Apple 協議問題，將錯誤交給 Erik 處理；不要建立新的 bundle identifier、Expo project 或替換憑證。

建置完成後，從結果複製這次的 EAS build UUID，用明確 ID 上傳，避免選到別人的建置：

```bash
npx eas-cli@27.7.2 submit --platform ios --profile production --id YOUR_EAS_BUILD_ID --non-interactive --wait
```

EAS 已存有 App Store Connect 上傳 API key。`eas.json` 中的 `appleId: dev@tenten.co` 是既有擁有者設定，沿用時不需要 Maggie 共用該帳號密碼。若 CLI 要求新增 Apple 登入，先確認是否選到既有 API key。

Apple 處理完後，在 App Store Connect → 深空省省 → TestFlight：

- 內部測試：接受 App Manager 邀請後，可在 `Core QA` 加入自己的使用者，並確認新 build 已加入群組。
- 既有外部群組：將新 build 加到 `Maggie & Erik UI Testing`，填寫測試說明；若出現 Beta App Review，送出後等 Apple 核准。目前外部群組最新可測試的是 1.0.0（Build 6）；Build 8 的 1.0.0 已正式發布，Apple 已關閉該版本的外部 Beta Review，新外部測試版需使用 1.0.1 等新版本。
- iPhone 開啟 TestFlight 更新，確認版本與 build number，再測試畫面、資料重啟保存及登入／雲端流程。

上傳 TestFlight 與正式 App Store 發布分開處理。正式上架時，另外完成 `docs/IOS_RELEASE_PREPARATION.md`、`docs/APP_STORE_REVIEW_PACKAGE.md` 與 production release gate。

## 4. 可直接貼給 agent

```text
請在 tentendev/lad-app 的 Expo 專案工作，先讀 AGENTS.md 與 docs/MAGGIE_DEVELOPMENT_QUICKSTART.md。
這次需求：［填入畫面或功能修改］。
先確認 Git 狀態並建立工作分支，保留既有未提交修改。
用 Node.js 22.13 以上與 npm ci；Expo 登入使用 Maggie 自己已接受邀請的帳號。
開發預覽從 EAS preview 拉取公開環境值。先啟動 Web 並檢查主流程；原生畫面需另外驗收。
保留 Expo owner tentenco、project ID 46cd6a19-3d6a-4b81-b08b-a531cb15664f、bundle ID com.tenten.deepspaceledger、Apple team RTK85AV2H2、ASC app ID 6812909987。
保留 schedule.js 與 updates.js 的原作同步規則；沒有明確要求就不要發布功能公告。
完成修改與適當驗證，再執行 npm run release:ios:validate。
若本次有授權上傳 TestFlight，先設定下一個 expo.version，commit 本次檔案並 push；使用 production profile、既有遠端憑證及 --non-interactive --freeze-credentials 建置。
使用本次明確 EAS build ID 上傳，再確認 Apple 處理狀態與測試群組可用性。
不要建立另一個 Expo project、變更 App 身分、重建憑證、複製伺服器密鑰或自行填寫尚未驗收的 release flags。
不要部署或覆蓋 its-maggie/lad-app 的 HTML production 網站。
回報改了什麼、驗證結果、commit、build ID 與仍需本人處理的項目。
```

## 5. 目前需要本人完成

2026-11-11 已送出上述邀請，帳號啟用仍需 Maggie 接受與完成自己的驗證。Apple 另外提示開發者協議已更新，後續更新 App 前，需要 Account Holder 在 [Apple Developer 帳號頁](https://developer.apple.com/account) 審閱並接受。Maggie 的 App Manager 權限無法代替 Account Holder 完成這一步。

已用 GitHub 的全新 clone 驗證 `npm ci`、lint、TypeScript、192 項測試、iOS build preflight、preview 環境下載與 Web export。這些是開發環境檢查；Maggie 自己電腦的登入、建置及 iPhone 安裝，需要在接受邀請後完成。

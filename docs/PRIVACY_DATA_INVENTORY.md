# 深空省省資料清冊與 App Privacy 對照

更新日期：2026-08-14

這份清冊是 App Store Connect「App Privacy」問卷的填寫依據。送審前仍要以 Clerk、Vercel、Neon 的 production 設定與最新 SDK 行為再核對一次；若新增分析、廣告、推播、付款或崩潰回報 SDK，必須先更新本表、隱私政策與 manifest。

| Apple 資料類型 | 何時處理 | 儲存／處理方 | Linked | Tracking | 用途 |
| --- | --- | --- | --- | --- | --- |
| Name | 使用者建立或修改會員資料、社群登入回傳 | Clerk | 是 | 否 | App Functionality |
| Email Address | 註冊、驗證、登入、找回密碼 | Clerk | 是 | 否 | App Functionality |
| User ID | 建立 Clerk 會員、隔離 Neon snapshot | Clerk、Vercel、Neon | 是 | 否 | App Functionality；Fraud Prevention & Security |
| Device ID | 驗證服務依設定可能處理裝置識別資訊以維持 session、防止濫用 | Clerk | 是（保守申報） | 否 | App Functionality；Fraud Prevention & Security |
| Other Diagnostic Data | 驗證／API 服務依設定可能保留 IP、瀏覽器／作業系統與必要請求紀錄 | Clerk、Vercel | 是（保守申報） | 否 | App Functionality；Fraud Prevention & Security |
| Other Financial Info | 使用者主動上傳預算與實際花費 snapshot | Neon，經 Vercel API | 是 | 否 | App Functionality |
| Other User Content | 使用者主動上傳抽卡資源、換算設定、抽卡規劃、五星紀錄與備註 snapshot | Neon，經 Vercel API | 是 | 否 | App Functionality |
| Customer Support | 使用者主動寄送支援信時的 Email、內容與附件 | 公開支援信箱供應商 | 是 | 否 | App Functionality |

## 不收集／不使用

- 不存取付款卡、銀行帳戶或遊戲帳號。
- 不含廣告 SDK，不建立跨 App／網站廣告追蹤資料。
- 不把本機紀錄自動上傳；只有會員按下上傳按鈕時才建立 Neon snapshot。
- Clerk SDK telemetry 已以 `telemetry={false}` 關閉；production instance 原本也不會傳送 development telemetry。
- authentication token 與 request IP 如只在完成請求期間暫時傳輸而未保留，依 Apple 定義不屬於 collected；本清冊仍對供應商可能保留的安全紀錄採保守申報。

## 資料生命週期

1. 未登入資料只在裝置本機。
2. 會員資料由 Clerk 保存；session token 在 iOS 使用 SecureStore。
3. 使用者明確上傳後，Neon 以 Clerk user ID 為主鍵保存一份 snapshot。
4. 「只刪除雲端備份」會刪除 Neon row，但保留 Clerk 會員與本機資料。
5. 「永久刪除帳號」會先刪除 Neon row、嘗試撤銷 Sign in with Apple token，再刪除 Clerk user；本機資料保留。
6. Apple token 無法自動撤銷時，刪除仍完成，UI 會提供手動撤銷路徑。

## App Store Connect 建議答案

- Data Used to Track You：No。
- Data Linked to You：上表所有申報項目均選 Yes；若 production 供應商書面確認 Device ID／diagnostic data 不保留，再有證據地縮減。
- Purpose：依上表選 App Functionality；User ID、Device ID、Other Diagnostic Data 另選 Fraud Prevention and Security。
- Privacy Policy URL：`https://lad-pocket.vercel.app/privacy`
- Privacy Choices URL：`https://lad-pocket.vercel.app/account`

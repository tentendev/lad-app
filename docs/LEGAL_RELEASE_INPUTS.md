# 上架法律與營運資料輸入表

以下欄位必須由 App 擁有者確認。不要把 Apple 密碼、2FA 驗證碼、Clerk secret、Neon URL、Apple `.p8` 私鑰或 App Store Connect API private key 寫進此檔或聊天。

## 必填公開資料

- 法律實體完整名稱：待提供
- App／網站對外營運者名稱：待提供
- 公開支援 Email：待提供
- 隱私權請求 Email（可與支援信箱相同）：待提供
- 版權顯示名稱，例如「2026 ○○」：待提供
- 營運地／適用主要司法管轄：待提供

這些值確定後要同步到：

1. Vercel Production：`EXPO_PUBLIC_LEGAL_ENTITY_NAME`、`EXPO_PUBLIC_SUPPORT_EMAIL`
2. EAS Production：同名 public variables
3. App Store Connect：Seller／Copyright／Support URL／Privacy URL／Review Contact
4. 本文件與公開隱私政策的最終法律審閱

## 需要擁有者作成的聲明

- Bundle ID `com.tenten.deepspaceledger` 已核准且不再更換：待確認
- 保留 iPad 支援並提供 13 吋 iPad 截圖：待確認
- App 內第三方遊戲名稱、角色名、活動內容、美術與商標的權利狀態：
  - 已取得可供 App Store 發布的書面授權；或
  - 送審版已移除／替換所有需要授權的內容。
- Content Rights 問卷的回答與證明文件位置：待確認
- EU Digital Services Act trader status 與聯絡資訊：待確認
- 年齡分級問卷由擁有者依實際內容確認：待確認
- 免費、無 IAP、無訂閱：目前程式實況是「是」，送審前待再次確認
- 非豁免加密：目前僅使用系統／HTTPS 標準加密，`ITSAppUsesNonExemptEncryption=false`，待擁有者確認

## 不能用免責聲明取代的項目

「非官方／與遊戲商無關」文字不能取代第三方 IP 授權。若無權利證明，最安全的送審路徑是把名稱、人物、活動資料與素材改為完全原創或由使用者自行輸入，再重新檢查 metadata、截圖與 App 內畫面。


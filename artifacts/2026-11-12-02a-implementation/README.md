# 02A App 實作與檢查畫面

選定方向：[02A 霧光星軌・原版](02a-approved-reference.png)。此圖是設計參考，其他 PNG 為本次 App Web renderer 的實際畫面，均非原生實機截圖。

- [錢包](wallet-390.png)：獨立測試 origin，預算 3,000、測試花費 1,280、剩餘 1,720，均為介面驗證資料。
- [排期](schedule-390.png)、[換算](calculator-390.png)、[追蹤](tracker-390.png)。
- [會員登入](account-390.png)、[管理後台未登入狀態](admin-390.png)。沒有以其他人的登入取得或擷取真實會員清單。
- `responsive-checks.json`：390px／320px 的頁面寬度檢查。
- `desktop-checks.json`：1024px 的六個主要畫面寬度檢查。

完整變更與連線待辦見 [實作紀錄](../../docs/02A_MEMBERSHIP_IMPLEMENTATION.md)。原版 UI 備份位於父工作區的 `備份/App-2026-11-12-改版前/`，並有 Git 分支 `backup/20261112-before-02a-membership`。

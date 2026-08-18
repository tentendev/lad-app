import { useState, type ChangeEvent, type JSX } from "react";

import { storage } from "@/data/repositories/storage";
import { restoreLocalBackup } from "@/data/repositories/backupRestore";
import { readLocalBackupData } from "@/data/repositories/localBackupData";
import { STORAGE_KEYS, STORAGE_PREFIX } from "@/data/repositories/storage.types";
import { createLocalBackup, parseLocalBackup } from "@/domain/backup";
import { WebPage } from "@/ui/WebPage.web";

export default function AboutScreen(): JSX.Element {
  const [backupStatus, setBackupStatus] = useState<{ tone: "ok" | "error"; message: string } | null>(null);
  const [backupBusy, setBackupBusy] = useState(false);

  function downloadJson(value: unknown, filename: string) {
    const blobUrl = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(blobUrl);
  }

  async function downloadBackup() {
    setBackupBusy(true);
    try {
      const backup = createLocalBackup(await readLocalBackupData(storage));
      downloadJson(backup, `deep-space-ledger-backup-${new Date().toISOString().slice(0, 10)}.json`);
      setBackupStatus({ tone: "ok", message: "備份檔已下載。請把檔案保存到安全的位置。" });
    } catch {
      setBackupStatus({ tone: "error", message: "一般備份無法建立，可能有資料格式損壞。請先下載原始救援檔，避免遺失現有內容。" });
    } finally {
      setBackupBusy(false);
    }
  }

  function downloadRecoveryCopy() {
    try {
      const raw = Object.fromEntries(
        Object.values(STORAGE_KEYS).map((key) => [key, window.localStorage.getItem(`${STORAGE_PREFIX}${key}`)]),
      );
      downloadJson(
        { product: "deep-space-ledger-recovery", exportedAt: new Date().toISOString(), raw },
        `deep-space-ledger-recovery-${new Date().toISOString().slice(0, 10)}.json`,
      );
      setBackupStatus({ tone: "ok", message: "原始救援檔已下載。這份檔案用於保留損壞資料，不能直接還原。" });
    } catch {
      setBackupStatus({ tone: "error", message: "原始救援檔下載失敗。請先不要清除網站資料或移除瀏覽器。" });
    }
  }

  async function restoreBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    if (file.size > 1_000_000) {
      setBackupStatus({ tone: "error", message: "備份檔超過 1 MB，為安全起見沒有讀取。" });
      return;
    }
    setBackupBusy(true);
    try {
      const restored = parseLocalBackup(await file.text());
      if (!window.confirm("還原備份會覆蓋這台裝置目前的預算、花費、換算設定、抽卡規劃、五星紀錄與排期篩選。確定繼續嗎？")) {
        setBackupStatus({ tone: "ok", message: "已取消還原，現有資料沒有變更。" });
        return;
      }
      await restoreLocalBackup(storage, restored);
      setBackupStatus({ tone: "ok", message: "備份已還原。前往錢包即可確認資料。" });
    } catch (error) {
      setBackupStatus({ tone: "error", message: error instanceof Error ? error.message : "備份還原失敗。" });
    } finally {
      setBackupBusy(false);
    }
  }

  return (
    <div className="web-app standalone-page">
      <main className="web-main">
        <WebPage
          eyebrow="About"
          title="關於深空省省"
          description="服務定位、資料保存方式與隱私說明。"
          showAboutLink={false}
          action={(
            <a className="back-link" href="/schedule" aria-label="返回排期頁">
              <span aria-hidden="true">‹</span>
              返回排期
            </a>
          )}
        >
          <section className="product-card card trust-card" aria-labelledby="about-product">
            <p className="card-kicker">產品定位</p>
            <h2 id="about-product" className="trust-title">抽卡課金規劃工具</h2>
            <p>深空省省是玩家自製的規劃工具，支援《戀與深空》的排期整理、預算記錄與資源換算。</p>
            <p>本工具與遊戲開發商、發行商或營運商沒有隸屬、授權或合作關係。遊戲名稱與角色名稱的相關權利屬於各自權利人。</p>
          </section>

          <section className="product-card card trust-card" aria-labelledby="about-schedule">
            <p className="card-kicker">排期資訊</p>
            <h2 id="about-schedule" className="trust-title">官方資訊與玩家推測分開標示</h2>
            <p>排期資料整理自公開資訊；尚未正式公告的內容會標示為預測。實際活動與卡池時間仍應以官方公告為準。</p>
          </section>

          <section className="product-card card trust-card" aria-labelledby="about-privacy">
            <p className="card-kicker">資料與隱私</p>
            <h2 id="about-privacy" className="trust-title">本機優先 · 雲端備份由你決定</h2>
            <p>未登入時，預算、花費、換算設定、抽卡規劃、五星紀錄與排期篩選只儲存在這個瀏覽器，不會送到深空省省的伺服器，也不會公開。</p>
            <p>登入後，你可以明確選擇把紀錄上傳至自己的 Neon 雲端備份。為避免跨裝置衝突，系統不會靜默覆寫；下載雲端資料前也會再次確認。</p>
            <p>Google／Apple 登入由 Clerk 提供，會處理帳號識別、姓名與電子郵件。本工具不含廣告 SDK，也不做跨 App 追蹤。</p>
          </section>

          <section className="product-card card trust-card" aria-labelledby="about-account-delete">
            <p className="card-kicker">帳號控制</p>
            <h2 id="about-account-delete" className="trust-title">可隨時登出或永久刪除</h2>
            <p>你可以在「會員中心」中管理個人資料、更新密碼、登出，或永久刪除 Clerk 帳號與 Neon 雲端備份。刪除會員帳號不會刪除這台裝置上的本機紀錄，方便先匯出或繼續離線使用。</p>
            <div className="backup-actions"><a className="backup-button" href="/account">前往會員中心</a><a className="backup-button" href="/privacy">完整隱私政策</a><a className="backup-button" href="/support">支援中心</a></div>
          </section>

          <section className="product-card card trust-card" aria-labelledby="about-backup">
            <p className="card-kicker">本機備份</p>
            <h2 id="about-backup" className="trust-title">匯出或還原你的紀錄</h2>
            <p>一般備份包含預算、花費、規劃、五星紀錄與排期篩選，可直接還原；原始救援檔則完整保留每個 storage key，供資料損壞時救援，不能直接還原。這兩個按鈕只在瀏覽器本機處理檔案，不會自動上傳。</p>
            <div className="backup-actions">
              <button className="backup-button" type="button" disabled={backupBusy} onClick={() => void downloadBackup()}>{backupBusy ? "處理中…" : "下載備份"}</button>
              <label className="backup-button" aria-disabled={backupBusy}>
                選擇備份檔
                <input className="visually-hidden" type="file" accept="application/json,.json" disabled={backupBusy} onChange={(event) => void restoreBackup(event)} />
              </label>
              <button className="backup-button" type="button" disabled={backupBusy} onClick={downloadRecoveryCopy}>下載原始救援檔</button>
            </div>
            {backupStatus ? (
              <p className={`backup-status ${backupStatus.tone}`} role={backupStatus.tone === "error" ? "alert" : "status"}>
                {backupStatus.message}
              </p>
            ) : null}
          </section>

          <p className="about-updated">說明更新：2026-08-19</p>
        </WebPage>
      </main>
    </div>
  );
}

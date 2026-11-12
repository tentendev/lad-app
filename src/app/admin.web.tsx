import { Button } from "@heroui/react/button";
import { Card } from "@heroui/react/card";
import { Input } from "@heroui/react/input";
import { useEffect, useRef, useState, type FormEvent, type PropsWithChildren } from "react";
import { isLocalPreview } from "@/auth/localPreview";
import type { ManagedMember } from "@/data/membershipApi";
import { useMembersModel } from "@/features/admin/useMembersModel";
import { WebPage } from "@/ui/WebPage.web";

function date(value: string | number | null) { return value === null ? "尚無紀錄" : new Date(value).toLocaleString("zh-TW"); }

function AdminPage({ children }: PropsWithChildren) {
  return <div className="web-app standalone-page"><main className="web-main admin-main"><WebPage eyebrow="Member Administration" title="會員管理" description="管理會員帳號與備份狀態。">{children}</WebPage></main></div>;
}

function ActionDialog({ member, busy, error, onClose, onSubmit }: { member: ManagedMember; busy: boolean; error: string | null; onClose: () => void; onSubmit: (reason: string) => Promise<void> }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [reason, setReason] = useState("");
  const [invalid, setInvalid] = useState(false);
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => dialog?.close(); }, []);
  function submit(event: FormEvent) {
    event.preventDefault();
    if (reason.trim().length < 2) return setInvalid(true);
    void onSubmit(reason);
  }
  return <dialog ref={ref} className="member-action-dialog" aria-labelledby="member-action-title" onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}>
    <form onSubmit={submit}>
      <h2 id="member-action-title">{member.banned ? "恢復會員帳號" : "停權會員帳號"}</h2>
      <p><strong>{member.name}</strong><br/>{member.email ?? member.id}</p>
      <p>{member.banned ? "恢復後，這位會員可以重新登入。" : "停權會撤銷這位會員的登入狀態並禁止再次登入，原有備份仍會保留。"}</p>
      <label className="field-wrap"><span className="field-label">操作原因（2–240 字）</span><Input aria-label="會員管理操作原因" autoFocus maxLength={240} value={reason} onChange={event => { setReason(event.target.value); setInvalid(false); }} /></label>
      {invalid ? <p className="field-error" role="alert">請填寫至少 2 個字的操作原因。</p> : null}
      {error ? <p className="field-error" role="alert">{error}</p> : null}
      <div className="member-actions"><Button type="button" variant="ghost" isDisabled={busy} onPress={onClose}>取消</Button><Button type="submit" isDisabled={busy}>{busy ? "處理中…" : member.banned ? "確認恢復" : "確認停權"}</Button></div>
    </form>
  </dialog>;
}

function ConnectedAdmin() {
  const model = useMembersModel();
  const [selection, setSelection] = useState<{ viewerId: string; member: ManagedMember } | null>(null);
  const selected = model.page && selection?.viewerId === model.page.viewerId ? selection.member : null;
  function setSelected(member: ManagedMember | null) {
    setSelection(member && model.page ? { viewerId: model.page.viewerId, member } : null);
  }
  return <AdminPage>
    <div className="admin-heading"><div><p className="card-kicker">管理後台</p><h2>會員管理</h2><p className="page-description">查看帳號與備份狀態，保留每次管理操作的原因。</p></div><a className="back-link" href="/account">回會員中心</a></div>
    {!model.isLoaded ? <Card className="product-card" aria-busy="true">正在確認登入狀態…</Card>
      : !model.isSignedIn ? <Card className="product-card"><h3>請先登入管理者帳號</h3><a className="backup-button" href="/account">前往登入</a></Card>
        : model.forbidden ? <Card className="product-card" role="alert"><h3>目前無法進入會員管理</h3><p>{model.error}</p><a href="/account">返回會員中心</a></Card>
          : <div className="stack">
            <Card className="product-card">
              <form className="member-search" onSubmit={event => { event.preventDefault(); void model.submitSearch(); }}>
                <label className="field-wrap"><span className="field-label">搜尋會員</span><Input aria-label="搜尋會員" type="search" placeholder="Email、名稱或會員 ID" maxLength={120} value={model.query} onChange={event => model.setQuery(event.target.value)} /></label>
                <Button type="submit" isDisabled={model.busy}>搜尋</Button><Button variant="ghost" isDisabled={model.busy} onPress={() => void model.refresh()}>重新整理</Button>
              </form>
              {model.notice ? <p className="account-status ok" role="status">{model.notice}</p> : null}
              {model.error ? <p className="account-status error" role="alert">{model.error}</p> : null}
              <p className="section-meta" aria-live="polite">{model.busy ? "正在載入…" : model.page ? `符合條件 ${model.page.totalCount} 位 · 第 ${Math.floor(model.page.offset / model.page.limit) + 1} 頁` : "準備載入會員清單"}</p>
            </Card>
            {model.page ? <>
              <div className="member-grid">{model.page.members.map(member => <Card className="product-card member-card" key={member.id}>
                <div className="section-heading"><h3>{member.name}</h3><span className={`member-badge ${member.banned ? "suspended" : ""}`}>{member.isAdmin ? "管理者" : member.banned ? "已停權" : "正常"}</span></div>
                <p className="member-email">{member.email ?? "未設定 Email"}</p><p className="section-meta">{member.emailVerified ? "Email 已驗證" : "Email 未驗證"}</p>
                <dl className="member-details"><div><dt>加入時間</dt><dd>{date(member.createdAt)}</dd></div><div><dt>最近登入</dt><dd>{date(member.lastSignInAt)}</dd></div><div><dt>私人備份</dt><dd>{member.backup ? `第 ${member.backup.revision} 版 · ${date(member.backup.updatedAt)}` : "尚未建立"}</dd></div></dl>
                <p className="member-id">{member.id}</p>
                <Button variant="secondary" isDisabled={model.busy || member.isAdmin || member.id === model.page?.viewerId} onPress={() => setSelected(member)}>{member.isAdmin ? "管理者帳號受保護" : member.banned ? "恢復帳號" : "停權帳號"}</Button>
              </Card>)}</div>
              {!model.page.members.length ? <Card className="product-card empty-state">沒有符合條件的會員。</Card> : null}
              <div className="member-pagination"><Button variant="ghost" isDisabled={model.busy || model.page.offset === 0} onPress={() => void model.previous()}>上一頁</Button><Button variant="ghost" isDisabled={model.busy || model.page.offset + model.page.limit >= model.page.totalCount} onPress={() => void model.next()}>下一頁</Button></div>
              <Card className="product-card"><h3>最近管理紀錄</h3><p className="section-meta">只保留管理資訊，這裡不會顯示會員的預算或抽卡明細。</p><div className="audit-list">{model.page.audit.length ? model.page.audit.map(item => <div key={item.id}><strong>{item.action === "ban" ? "停權" : "恢復"} · {item.result === "succeeded" ? "已完成" : item.result === "failed" ? "未完成" : "待確認"}</strong><p>{item.reason}</p><small>{date(item.createdAt)}<br/>管理者 {item.actorId}<br/>會員 {item.targetId}</small></div>) : <p className="section-meta">尚無管理操作。</p>}</div></Card>
            </> : null}
          </div>}
    {selected ? <ActionDialog member={selected} busy={model.busy} error={model.error} onClose={() => setSelected(null)} onSubmit={async reason => { if (await model.changeStatus(selected, reason)) setSelected(null); }} /> : null}
  </AdminPage>;
}

export default function AdminScreen() {
  if (isLocalPreview()) return <AdminPage><Card className="product-card"><h2>請使用會員連線模式</h2><p>目前是僅供本機功能的預覽，會員管理需要管理者登入。</p><a href="/account">返回會員中心</a></Card></AdminPage>;
  return <ConnectedAdmin />;
}

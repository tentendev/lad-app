import { useEffect, useId, useRef } from "react";
import { useSiteUpdates } from "./SiteUpdatesProvider";

export function SiteUpdatesEntry() {
  const { latest, ready, unread, open } = useSiteUpdates();
  if (!latest) return null;
  return <button type="button" className="updates-launch" disabled={!ready} aria-label="查看最近更新" title="最近更新" aria-haspopup="dialog" onClick={open}>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>
    {unread ? <span className="updates-launch-dot" aria-hidden="true" /> : null}
  </button>;
}

export function SiteUpdatesDialog() {
  const { latest, unread, visible, dismiss } = useSiteUpdates();
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const id = useId();
  useEffect(() => {
    const element = dialog.current;
    if (!visible || !element) return;
    if (!element.open) element.showModal();
    closeButton.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [visible]);
  if (!latest) return null;
  return <dialog ref={dialog} className="updates-dialog" aria-labelledby={`${id}-title`} onCancel={event => { event.preventDefault(); dismiss(); }} onClose={() => {
    if (visible) dismiss();
    document.querySelector<HTMLButtonElement>(".updates-launch")?.focus({ preventScroll: true });
  }}>
    <div className="updates-head">
      <div><div className="updates-heading"><h2 id={`${id}-title`}>最近更新</h2>{unread ? <span className="updates-unread">新更新</span> : null}</div><div className="updates-date">{latest.date.replaceAll("-", "/")}</div></div>
      <button ref={closeButton} className="updates-close" type="button" aria-label="關閉最近更新" onClick={dismiss}>×</button>
    </div>
    <div className="updates-content">
      <ul role="list">{latest.items.map((item, index) => <li key={index}><div className="update-kind">{item.type === "schedule" ? "排期" : "功能"}</div><h3>{item.title}</h3><p>{item.body}</p></li>)}</ul>
      <button type="button" className="updates-read" onClick={dismiss}>知道了</button>
    </div>
  </dialog>;
}

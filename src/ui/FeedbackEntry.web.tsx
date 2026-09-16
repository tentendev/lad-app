import { useId, useRef } from "react";
import { FEEDBACK_DESCRIPTION, FEEDBACK_URL } from "@/config/feedback";

export function FeedbackEntry() {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  return <>
    <button ref={trigger} type="button" className="feedback-entry" aria-label="開啟使用回饋問卷確認視窗" onClick={() => dialog.current?.showModal()}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7A8.4 8.4 0 0 1 4 11.5a8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/><path d="M8 10h9M8 14h5"/></svg>
      回饋
    </button>
    <dialog ref={dialog} className="feedback-dialog" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} onClose={() => trigger.current?.focus()} onKeyDown={(event) => {
      if (event.key !== "Tab") return;
      const controls = dialog.current?.querySelectorAll<HTMLElement>("button, a[href]");
      if (!controls?.length) return;
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }}>
      <div className="feedback-dialog-heading"><h2 id={`${id}-title`}>前往使用回饋問卷？</h2><button type="button" aria-label="關閉問卷確認視窗" onClick={() => dialog.current?.close()}>×</button></div>
      <p id={`${id}-description`}>{FEEDBACK_DESCRIPTION}</p>
      <div className="feedback-dialog-actions"><button type="button" onClick={() => dialog.current?.close()}>先不要</button><a href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer" onClick={() => dialog.current?.close()}>前往問卷 ↗</a></div>
    </dialog>
  </>;
}

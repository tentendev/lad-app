import { useEffect, useRef, type PropsWithChildren } from "react";
import { createPortal } from "react-dom";

export function WebDialog({ labelId, onClose, children }: PropsWithChildren<{ labelId: string; onClose: () => void }>) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("input, button, select")?.focus();
    return () => {
      document.body.style.overflow = overflow;
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
    };
  }, []);
  if (typeof document === "undefined") return null;
  return createPortal(<div className="app-dialog-backdrop" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div ref={panel} className="app-dialog-panel" role="dialog" aria-modal="true" aria-labelledby={labelId} onKeyDown={event => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); }
      if (event.key !== "Tab") return;
      const controls = [...(panel.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), a[href], [tabindex="0"]') ?? [])];
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }}>{children}</div>
  </div>, document.body);
}

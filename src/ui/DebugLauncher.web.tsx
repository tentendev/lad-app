import { Button } from "@heroui/react/button";
import { useEffect, useRef, useState } from "react";

const TOOLS = [
  {
    href: "/roadmap.html",
    title: "Features Roadmap",
    description: "優先級與執行清單",
    icon: "roadmap",
  },
  {
    href: "/urls.html",
    title: "URL Index",
    description: "全站連結與健康檢查",
    icon: "link",
  },
  {
    href: "/changelog.html",
    title: "Changelog",
    description: "版本更新與交接紀錄",
    icon: "history",
  },
] as const;

function ToolIcon({ name }: { name: (typeof TOOLS)[number]["icon"] }) {
  if (name === "roadmap") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19V9M10 19V5M16 19v-7M22 19H2" />
      </svg>
    );
  }
  if (name === "link") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
        <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5M12 7v5l3 2" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg className="debug-external" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 3h7v7M10 14 21 3" />
      <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
    </svg>
  );
}

export function DebugLauncher() {
  const [open, setOpen] = useState(false);
  const launcherRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function closeFromOutside(event: PointerEvent) {
      if (!launcherRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function closeFromKeyboard(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    }

    document.addEventListener("pointerdown", closeFromOutside);
    document.addEventListener("keydown", closeFromKeyboard);
    return () => {
      document.removeEventListener("pointerdown", closeFromOutside);
      document.removeEventListener("keydown", closeFromKeyboard);
    };
  }, [open]);

  function closeAndRestoreFocus() {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  return (
    <div className="debug-launcher" ref={launcherRef}>
      <aside className="debug-panel" id="debug-tools-panel" aria-label="內部 Debug 工具" hidden={!open}>
        <div className="debug-panel-head">
          <span>Internal tools</span>
          <Button
            isIconOnly
            variant="ghost"
            className="debug-close"
            type="button"
            aria-label="關閉 Debug 工具"
            onPress={closeAndRestoreFocus}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden="true">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </Button>
        </div>
        {TOOLS.map((tool) => (
          <a
            className="debug-link"
            href={tool.href}
            key={tool.href}
            target="_blank"
            rel="noopener"
            onClick={() => setOpen(false)}
          >
            <span className="debug-link-icon" aria-hidden="true"><ToolIcon name={tool.icon} /></span>
            <span className="debug-link-copy">
              <strong>{tool.title}</strong>
              <small>{tool.description}</small>
            </span>
            <ExternalIcon />
          </a>
        ))}
      </aside>
      <Button
        ref={triggerRef}
        variant="ghost"
        className="debug-trigger"
        type="button"
        aria-expanded={open}
        aria-controls="debug-tools-panel"
        onPress={() => setOpen((current) => !current)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m8 9-3 3 3 3M16 9l3 3-3 3M13.5 6l-3 12" />
        </svg>
        <span className="debug-trigger-label">DEBUG</span>
      </Button>
    </div>
  );
}

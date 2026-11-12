import Head from "expo-router/head";
import { useEffect, useRef, type PropsWithChildren, type ReactNode } from "react";

import { AccountEntry } from "@/ui/AccountEntry.web";
import { SiteUpdatesEntry } from "@/ui/SiteUpdates.web";

type Props = PropsWithChildren<{
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
  showAccountEntry?: boolean;
  showAboutLink?: boolean;
}>;

export function WebPage({ eyebrow, title, description, action, showAccountEntry = true, showAboutLink = true, children }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const motto = ({ 錢包: "把喜歡，留在計畫裡。", 換算: "離心願，再近一點。", 追蹤: "記下每次心動的軌跡。", 會員中心: "把計畫，好好保存。" } as Record<string, string>)[title];

  useEffect(() => {
    headingRef.current?.focus();
  }, [title]);

  return (
    <div className="page-shell" onWheelCapture={() => {
      // Scrolling a long form must not silently change a focused numeric value.
      const active = document.activeElement;
      if (active instanceof HTMLInputElement && active.type === "number") active.blur();
    }}>
      <Head>
        <title>{title}｜深空省省</title>
        <meta name="description" content={description} />
      </Head>
      <div className="visually-hidden">
        <span>{eyebrow}</span>
        <h1 ref={headingRef} tabIndex={-1}>{title}</h1>
        <p>{description}</p>
      </div>
      <header className="brand-header">
        <SiteUpdatesEntry />
        <a href="/schedule" className="brand-home" aria-label="深空省省首頁">
          <svg aria-hidden="true" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="24" cy="24" rx="21" ry="8" transform="rotate(-35 24 24)"/><path d="M32 4v8M28 8h8"/></svg>
          <span>深空省省</span>
        </a>
        {showAccountEntry ? <div className="brand-account"><AccountEntry /></div> : null}
      </header>
      {action ? (
        <div className="page-chrome">
          {action ? <div className="page-action">{action}</div> : <span />}
        </div>
      ) : null}
      {motto ? <p className="page-motto">{motto}<span aria-hidden="true">✦</span></p> : null}
      {children}
      {showAboutLink ? (
        <footer className="legal-footer">
          <a href="/account">會員中心</a>
          <span aria-hidden="true">·</span>
          <a href="/about">關於</a>
          <span aria-hidden="true">·</span>
          <a href="/privacy">隱私政策</a>
          <span aria-hidden="true">·</span>
          <a href="/support">支援</a>
          <span aria-hidden="true">·</span>
          <a href="https://www.threads.com/@chumei_0218" target="_blank" rel="noreferrer">製作：@chumei_0218</a>
        </footer>
      ) : null}
    </div>
  );
}

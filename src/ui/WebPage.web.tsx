import Head from "expo-router/head";
import { useEffect, useRef, type PropsWithChildren, type ReactNode } from "react";

import { AccountEntry } from "@/ui/AccountEntry.web";

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
        <a href="/schedule" className="brand-home" aria-label="深空省省首頁">
          <svg aria-hidden="true" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"><path d="M24 6l4 7h-8zM16 13h16l8 11-16 17L8 24z"/><path d="M8 24h32M16 13l8 28M32 13l-8 28M20 13l4 6 4-6"/></svg>
          <span>深空省省</span>
        </a>
        <p>你的抽卡與課金規劃好幫手</p>
        {showAccountEntry ? <div className="brand-account"><AccountEntry /></div> : null}
      </header>
      {action ? (
        <div className="page-chrome">
          {action ? <div className="page-action">{action}</div> : <span />}
        </div>
      ) : null}
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
        </footer>
      ) : null}
    </div>
  );
}

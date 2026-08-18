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
    <div className="page-shell">
      <Head>
        <title>{title}｜深空省省</title>
        <meta name="description" content={description} />
      </Head>
      <div className="visually-hidden">
        <span>{eyebrow}</span>
        <h1 ref={headingRef} tabIndex={-1}>{title}</h1>
        <p>{description}</p>
      </div>
      {action || showAccountEntry ? (
        <div className="page-chrome">
          {action ? <div className="page-action">{action}</div> : <span />}
          {showAccountEntry ? <AccountEntry /> : null}
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

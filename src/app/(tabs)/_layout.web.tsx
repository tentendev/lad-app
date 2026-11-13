import { Link, Slot, usePathname } from "expo-router";
import type { JSX } from "react";

import { DebugLauncher } from "@/ui/DebugLauncher.web";


const ITEMS = [
  { href: "/wallet", label: "錢包", icon: "wallet" },
  { href: "/schedule", label: "排期", icon: "calendar" },
  { href: "/calculator", label: "換算", icon: "exchange" },
  { href: "/tracker", label: "追蹤", icon: "chart" },
] as const;

const SHOW_DEBUG_TOOLS = process.env.EXPO_PUBLIC_ENABLE_DEBUG_TOOLS === "true";

function NavIcon({ name }: { name: (typeof ITEMS)[number]["icon"] }) {
  if (name === "wallet") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18M16 14h2" />
      </svg>
    );
  }
  if (name === "calendar") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="17" rx="2" /><path d="M8 2v4M16 2v4M3 9h18" />
      </svg>
    );
  }
  if (name === "chart") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 20V13h3v7M11 20V7h3v13M18 20V3h3v17" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7h18m-5-5 5 5-5 5M21 17H3m5-5-5 5 5 5" />
    </svg>
  );
}

export default function WebTabsLayout(): JSX.Element {
  const pathname = usePathname();

  return (
    <div className="web-app">
      <main className="web-main">
        <Slot />
      </main>
      {SHOW_DEBUG_TOOLS ? <DebugLauncher /> : null}
      <nav className="web-nav" aria-label="主要功能">
        {ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href as never}
              className={active ? "active" : ""}
              aria-current={active ? "page" : undefined}
            >
              <NavIcon name={item.icon} />
              {item.label}
            </Link>
          );
        })}

      </nav>
    </div>
  );
}

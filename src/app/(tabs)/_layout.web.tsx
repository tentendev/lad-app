import { Link, Slot, usePathname } from "expo-router";
import type { JSX } from "react";

import { DebugLauncher } from "@/ui/DebugLauncher.web";

const ITEMS = [
  { href: "/wallet", label: "錢包", icon: "wallet" },
  { href: "/schedule", label: "排期", icon: "calendar" },
  { href: "/calculator", label: "換算", icon: "diamond" },
  { href: "/tracker", label: "追蹤", icon: "star" },
] as const;

const SHOW_DEBUG_TOOLS = process.env.NODE_ENV !== "production"
  || process.env.EXPO_PUBLIC_ENABLE_DEBUG_TOOLS === "true";

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
  if (name === "star") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m12 3 8 7-8 11L4 10Z" /><path d="M4 10h16M8 4.8 12 10l4-5.2M8 10l4 11 4-11" />
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

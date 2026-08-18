import { useAuth, useUser } from "@clerk/expo";
import { Link } from "expo-router";
import type { JSX } from "react";

function MemberIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.7-4 3-6 7-6s6.3 2 7 6" />
    </svg>
  );
}

export function AccountEntry(): JSX.Element {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const name = user?.firstName?.trim() || "會員中心";
  const label = !isLoaded ? "會員中心" : isSignedIn ? name : "登入／註冊";

  return (
    <Link
      href="/account"
      className="account-entry"
    >
      <span className="account-entry-avatar" aria-hidden="true">
        {isSignedIn && user?.imageUrl ? <img src={user.imageUrl} alt="" /> : <MemberIcon />}
      </span>
      <span className="account-entry-copy">
        <small>{isSignedIn ? "已登入" : "會員"}</small>
        <strong>{label}</strong>
      </span>
      <svg className="account-entry-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m9 18 6-6-6-6" />
      </svg>
    </Link>
  );
}

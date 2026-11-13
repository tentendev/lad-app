import { isLocalPreview } from "@/auth/localPreview";
import { useAuth, useUser } from "@clerk/expo";
import { Link } from "expo-router";
import type { JSX } from "react";

function MemberIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="m9 3 1-2h4l1 2 2 1 2 0 2 4-1 2v3l1 2-2 4h-2l-2 1-1 2h-4l-1-2-2-1H5l-2-4 1-2v-3L3 8l2-4h2Z" />
    </svg>
  );
}

function ConnectedAccountEntry(): JSX.Element {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const name = user?.firstName?.trim() || "會員中心";
  const label = !isLoaded ? "會員中心" : isSignedIn ? name : "登入／註冊";

  return (
    <Link
      href="/account"
      className="account-entry"
      aria-label={label}
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

export function AccountEntry(): JSX.Element {
  if (isLocalPreview()) return <Link href="/account" className="account-entry" aria-label="本機預覽說明"><span className="account-entry-avatar" aria-hidden="true"><MemberIcon /></span><span className="account-entry-copy"><small>本機</small><strong>預覽模式</strong></span></Link>;
  return <ConnectedAccountEntry />;
}

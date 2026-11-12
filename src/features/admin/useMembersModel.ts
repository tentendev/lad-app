import { useAuth } from "@clerk/expo";
import { useCallback, useEffect, useRef, useState } from "react";
import { changeMemberStatus, getMemberPage, MembershipError, type ManagedMember, type MemberPage } from "@/data/membershipApi";

export function useMembersModel() {
  const { isLoaded, isSignedIn, userId, getToken } = useAuth();
  const [result, setResult] = useState<{ owner: string; page: MemberPage } | null>(null);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const generation = useRef(0);
  const page = result && result.owner === userId && isSignedIn ? result.page : null;

  const load = useCallback(async (value = "", offset = 0) => {
    if (!userId || !isSignedIn) return;
    const version = ++generation.current;
    setBusy(true); setError(null); setForbidden(false);
    try {
      const next = await getMemberPage(getToken, value, offset);
      if (version !== generation.current || next.viewerId !== userId) return;
      setResult({ owner: userId, page: next }); setSearch(value);
    } catch (caught) {
      if (version !== generation.current) return;
      setError(caught instanceof Error ? caught.message : "會員清單暫時無法載入。");
      if (caught instanceof MembershipError && [401, 403].includes(caught.status)) { setForbidden(true); setResult(null); }
    } finally { if (version === generation.current) setBusy(false); }
  }, [getToken, isSignedIn, userId]);

  useEffect(() => {
    const timer = setTimeout(() => { if (isLoaded && isSignedIn) void load(); }, 0);
    return () => { clearTimeout(timer); generation.current += 1; };
  }, [isLoaded, isSignedIn, load]);

  async function changeStatus(member: ManagedMember, reason: string) {
    if (busy || !page || reason.trim().length < 2) return false;
    const version = ++generation.current;
    setBusy(true); setError(null); setNotice(null);
    try {
      const { auditPending } = await changeMemberStatus(getToken, member.id, member.banned ? "unban" : "ban", reason);
      if (version !== generation.current) return false;
      setNotice(`${member.banned ? "已恢復" : "已停權"} ${member.name}。${auditPending ? "操作已完成，紀錄狀態仍待確認；請勿重複操作。" : ""}`);
      setBusy(false);
      await load(search, page.offset);
      return true;
    } catch (caught) {
      if (version === generation.current) { setError(caught instanceof Error ? caught.message : "操作未完成，請重試。"); setBusy(false); }
      return false;
    }
  }
  return { isLoaded, isSignedIn, page, query, setQuery, busy, error, notice, forbidden, changeStatus, refresh: () => load(search, page?.offset ?? 0), submitSearch: () => load(query.trim()), previous: () => load(search, Math.max(0, (page?.offset ?? 0) - 20)), next: () => load(search, (page?.offset ?? 0) + 20) };
}

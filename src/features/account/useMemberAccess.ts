import { useAuth } from "@clerk/expo";
import { useEffect, useState } from "react";
import { getMemberAccess, type MemberAccess } from "@/data/membershipApi";

export function useMemberAccess() {
  const { userId, isLoaded, isSignedIn, getToken } = useAuth();
  const [access, setAccess] = useState<MemberAccess | null>(null);
  useEffect(() => {
    let active = true;
    if (isLoaded && isSignedIn) void getMemberAccess(getToken).then(value => {
      if (active && value.userId === userId) setAccess(value);
    }).catch(() => { if (active) setAccess(null); });
    return () => { active = false; };
  }, [userId, isLoaded, isSignedIn, getToken]);
  return { isAdmin: Boolean(isSignedIn && access?.userId === userId && access.isAdmin) };
}

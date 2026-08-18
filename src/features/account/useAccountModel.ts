import { useAuth, useClerk, useUser } from "@clerk/expo";
import { useCallback, useEffect, useRef, useState } from "react";

import { emailAuthErrorMessage } from "@/auth/emailAuthErrors";
import { deleteRemoteAccount } from "@/data/accountApi";
import type { AccountDeletionResult } from "@/data/accountApi";
import { deleteCloudSnapshot, getCloudSnapshot, putCloudSnapshot } from "@/data/cloudSync";
import type { CloudSnapshot } from "@/data/cloudSync";
import { readLocalBackupData } from "@/data/repositories/localBackupData";
import { restoreLocalBackup } from "@/data/repositories/backupRestore";
import { storage } from "@/data/repositories/storage";

type Status = { tone: "ok" | "error" | "info"; message: string } | null;
type BusyAction = "refresh" | "push" | "pull" | "delete-cloud" | "profile" | "password" | "signout" | "delete";

function formatSyncError(error: unknown): string {
  return error instanceof Error ? error.message : "雲端同步暫時無法完成。";
}

export function useAccountModel() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const getTokenRef = useRef(getToken);
  const [snapshot, setSnapshot] = useState<CloudSnapshot | null>(null);
  const [busy, setBusy] = useState<BusyAction | null>(null);
  const [status, setStatus] = useState<Status>(null);
  const [profileStatus, setProfileStatus] = useState<Status>(null);

  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  const refresh = useCallback(async () => {
    if (!isSignedIn) return;
    setBusy("refresh");
    setStatus(null);
    try {
      setSnapshot(await getCloudSnapshot(getTokenRef.current));
    } catch (error) {
      setStatus({ tone: "error", message: formatSyncError(error) });
    } finally {
      setBusy(null);
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const timer = setTimeout(() => void refresh(), 0);
    return () => clearTimeout(timer);
  }, [isLoaded, isSignedIn, refresh]);

  async function push() {
    if (!isSignedIn) return;
    setBusy("push");
    setStatus(null);
    try {
      const local = await readLocalBackupData(storage);
      const next = await putCloudSnapshot(getTokenRef.current, local, snapshot?.revision ?? 0);
      setSnapshot(next);
      setStatus({ tone: "ok", message: "這台裝置的資料已安全更新到雲端。" });
    } catch (error) {
      setStatus({ tone: "error", message: formatSyncError(error) });
      if (error instanceof Error && "status" in error && error.status === 409) void refresh();
    } finally {
      setBusy(null);
    }
  }

  async function pull() {
    if (!snapshot?.data) return;
    setBusy("pull");
    setStatus(null);
    try {
      await restoreLocalBackup(storage, snapshot.data);
      setStatus({ tone: "ok", message: "雲端資料已下載到這台裝置；回到錢包即可查看。" });
    } catch (error) {
      setStatus({ tone: "error", message: formatSyncError(error) });
    } finally {
      setBusy(null);
    }
  }

  async function removeCloudBackup() {
    if (!isSignedIn) return false;
    setBusy("delete-cloud");
    setStatus(null);
    try {
      await deleteCloudSnapshot(getTokenRef.current);
      setSnapshot({ data: null, revision: 0, updatedAt: null });
      setStatus({ tone: "ok", message: "雲端備份已刪除；會員帳號與這台裝置的資料都會保留。" });
      return true;
    } catch (error) {
      setStatus({ tone: "error", message: formatSyncError(error) });
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function logOut() {
    setBusy("signout");
    setStatus(null);
    try {
      await signOut();
    } catch {
      setStatus({ tone: "error", message: "登出失敗，請稍後再試。" });
    } finally {
      setBusy(null);
    }
  }

  async function updateProfile(firstName: string, lastName: string) {
    if (!user) return false;
    setBusy("profile");
    setProfileStatus(null);
    try {
      await user.update({
        firstName: firstName.trim(),
        lastName: lastName.trim() || null,
      });
      setProfileStatus({ tone: "ok", message: "個人資料已更新。" });
      return true;
    } catch (error) {
      setProfileStatus({ tone: "error", message: emailAuthErrorMessage(error, "個人資料更新失敗，請稍後再試。") });
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function updatePassword(currentPassword: string, newPassword: string) {
    if (!user?.passwordEnabled) return false;
    setBusy("password");
    setProfileStatus(null);
    try {
      await user.updatePassword({ currentPassword, newPassword, signOutOfOtherSessions: true });
      setProfileStatus({ tone: "ok", message: "密碼已更新，其他裝置上的登入也已登出。" });
      return true;
    } catch (error) {
      setProfileStatus({ tone: "error", message: emailAuthErrorMessage(error, "密碼更新失敗，請確認目前密碼後再試。") });
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function deleteAccount(): Promise<AccountDeletionResult | null> {
    if (!isSignedIn) return null;
    setBusy("delete");
    setStatus(null);
    try {
      const result = await deleteRemoteAccount(getTokenRef.current);
      try {
        await signOut();
      } catch {
        // The server has already deleted the account; a stale local session is cleared by Clerk on refresh.
      }
      return result;
    } catch (error) {
      setStatus({ tone: "error", message: formatSyncError(error) });
      return null;
    } finally {
      setBusy(null);
    }
  }

  return {
    busy,
    deleteAccount,
    isLoaded,
    isSignedIn,
    logOut,
    profileStatus,
    pull,
    push,
    refresh,
    removeCloudBackup,
    snapshot,
    status,
    updatePassword,
    updateProfile,
    user,
  };
}

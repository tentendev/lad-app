import { apiEndpoint } from "@/data/apiEndpoint";
import type { GetToken } from "@/data/cloudSync";

export type AppleAuthorization = "not_connected" | "revoked" | "manual_required";

export type AccountDeletionResult = {
  deleted: true;
  appleAuthorization: AppleAuthorization;
};

export async function deleteRemoteAccount(getToken: GetToken): Promise<AccountDeletionResult> {
  const token = await getToken();
  if (!token) throw new Error("登入狀態已失效，請重新登入。");

  let response: Response;
  try {
    response = await fetch(apiEndpoint("/api/account"), {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new Error("無法連上帳號服務，請確認網路後再試一次。");
  }
  if (!response.ok) {
    const message = response.status === 401
      ? "登入狀態已失效，請重新登入。"
      : "帳號尚未刪除，請稍後再試；你的會員與雲端資料目前仍受保留。";
    throw new Error(message);
  }

  const value: unknown = await response.json();
  if (typeof value !== "object" || value === null || (value as Record<string, unknown>).deleted !== true) {
    throw new Error("帳號服務回傳格式不正確，請聯絡支援團隊。");
  }
  const authorization = (value as Record<string, unknown>).appleAuthorization;
  if (!["not_connected", "revoked", "manual_required"].includes(String(authorization))) {
    throw new Error("帳號服務回傳格式不正確，請聯絡支援團隊。");
  }
  return { deleted: true, appleAuthorization: authorization as AppleAuthorization };
}

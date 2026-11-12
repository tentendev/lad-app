import { apiEndpoint } from "./apiEndpoint";
import type { GetToken } from "./cloudSync";

export type MemberAccess = { userId: string; isAdmin: boolean };
export type ManagedMember = {
  id: string; name: string; email: string | null; emailVerified: boolean;
  createdAt: number; lastSignInAt: number | null; banned: boolean; isAdmin: boolean;
  backup: { revision: number; updatedAt: string } | null;
};
export type MemberAudit = { id: string; actorId: string; targetId: string; action: "ban" | "unban"; reason: string; result: "requested" | "succeeded" | "failed"; createdAt: string };
export type MemberPage = { viewerId: string; totalCount: number; offset: number; limit: number; members: ManagedMember[]; audit: MemberAudit[] };

export class MembershipError extends Error {
  constructor(message: string, readonly status: number) { super(message); this.name = "MembershipError"; }
}

async function request(getToken: GetToken, path: string, init: RequestInit = {}) {
  const token = await getToken();
  if (!token) throw new MembershipError("請先登入會員帳號。", 401);
  let response: Response;
  try {
    response = await fetch(apiEndpoint(path), { ...init, headers: { Accept: "application/json", Authorization: `Bearer ${token}`, ...(init.body ? { "Content-Type": "application/json" } : {}) } });
  } catch { throw new MembershipError("無法連上會員服務，請確認網路後重試。", 0); }
  if (!response.ok) {
    const code = await response.json().then((body: { error?: unknown }) => body.error).catch(() => null);
    const message = code === "member_not_found" ? "這位會員已移除，請重新整理清單。" : code === "protected_member" ? "無法在這裡停權自己或其他管理者。"
      : response.status === 403 ? "這個帳號沒有會員管理權限。"
        : response.status === 401 ? "登入狀態已失效，請重新登入。"
          : response.status === 429 ? "操作較頻繁，請稍後再試。"
            : "會員服務暫時無法使用，請稍後重試。";
    throw new MembershipError(message, response.status);
  }
  return response.json() as Promise<unknown>;
}

function record(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
function malformed(): never { throw new MembershipError("會員服務回傳格式不正確，請稍後重試。", 502); }

export async function getMemberAccess(getToken: GetToken): Promise<MemberAccess> {
  const value = await request(getToken, "/api/member");
  if (!record(value) || typeof value.userId !== "string" || typeof value.isAdmin !== "boolean") return malformed();
  return { userId: value.userId, isAdmin: value.isAdmin };
}

export async function getMemberPage(getToken: GetToken, search = "", offset = 0): Promise<MemberPage> {
  const value = await request(getToken, `/api/admin?search=${encodeURIComponent(search.trim())}&offset=${offset}`);
  if (!record(value) || typeof value.viewerId !== "string" || !Number.isSafeInteger(value.totalCount) || Number(value.totalCount) < 0 || !Number.isSafeInteger(value.offset) || Number(value.offset) < 0 || !Number.isSafeInteger(value.limit) || Number(value.limit) <= 0 || !Array.isArray(value.members) || !Array.isArray(value.audit)) return malformed();
  for (const member of value.members) {
    if (!record(member) || typeof member.id !== "string" || typeof member.name !== "string" || !(member.email === null || typeof member.email === "string") || typeof member.emailVerified !== "boolean" || !Number.isFinite(member.createdAt) || !(member.lastSignInAt === null || Number.isFinite(member.lastSignInAt)) || typeof member.banned !== "boolean" || typeof member.isAdmin !== "boolean") return malformed();
    if (member.backup !== null && (!record(member.backup) || !Number.isSafeInteger(member.backup.revision) || Number(member.backup.revision) <= 0 || typeof member.backup.updatedAt !== "string" || Number.isNaN(Date.parse(member.backup.updatedAt)))) return malformed();
  }
  for (const audit of value.audit) {
    if (!record(audit) || ![audit.id, audit.actorId, audit.targetId, audit.reason, audit.createdAt].every(field => typeof field === "string") || !["ban", "unban"].includes(String(audit.action)) || !["requested", "succeeded", "failed"].includes(String(audit.result)) || Number.isNaN(Date.parse(String(audit.createdAt)))) return malformed();
  }
  return value as unknown as MemberPage;
}

export async function changeMemberStatus(getToken: GetToken, userId: string, action: "ban" | "unban", reason: string): Promise<{ auditPending: boolean }> {
  const value = await request(getToken, "/api/admin", { method: "POST", body: JSON.stringify({ userId, action, reason: reason.trim() }) });
  if (!record(value) || !record(value.member) || value.member.id !== userId || typeof value.member.banned !== "boolean" || typeof value.auditPending !== "boolean") return malformed();
  return { auditPending: value.auditPending };
}

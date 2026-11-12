import { afterEach, describe, expect, it, vi } from "vitest";
import { changeMemberStatus, getMemberAccess, getMemberPage } from "@/data/membershipApi";

afterEach(() => vi.unstubAllGlobals());

describe("membership API client", () => {
  it("requires a session and encodes a bounded search instead of interpolating query syntax", async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({ viewerId: "user_admin", totalCount: 0, offset: 0, limit: 20, members: [], audit: [] }));
    vi.stubGlobal("fetch", fetcher);
    await expect(getMemberPage(async () => null)).rejects.toThrow("請先登入"); expect(fetcher).not.toHaveBeenCalled();
    await getMemberPage(async () => "token", "a+b@example.test &offset=99");
    expect(fetcher).toHaveBeenCalledWith("/api/admin?search=a%2Bb%40example.test%20%26offset%3D99&offset=0", expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer token" }) }));
  });
  it("keeps mutation inputs in an authenticated POST body", async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({ member: { id: "user_target", banned: true }, auditPending: false })); vi.stubGlobal("fetch", fetcher);
    await expect(changeMemberStatus(async () => "token", "user_target", "ban", " 測試原因 ")).resolves.toEqual({ auditPending: false });
    expect(fetcher).toHaveBeenCalledWith("/api/admin", expect.objectContaining({ method: "POST", body: JSON.stringify({ userId: "user_target", action: "ban", reason: "測試原因" }) }));
  });
  it("rejects malformed server roles rather than treating strings as truthy", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ userId: "user_member", isAdmin: "true" })));
    await expect(getMemberAccess(async () => "token")).rejects.toThrow("回傳格式");
  });
  it("rejects invalid backup metadata before the admin page renders it", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ viewerId: "user_admin", totalCount: 1, offset: 0, limit: 20, members: [{ id: "user_member", name: "旅人", email: null, emailVerified: false, createdAt: 1, lastSignInAt: null, banned: false, isAdmin: false, backup: { revision: -1, updatedAt: "invalid" } }], audit: [] })));
    await expect(getMemberPage(async () => "token")).rejects.toThrow("回傳格式");
  });
  it("shows a permission error without exposing server details", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ error: "admin_required", secret: "internal" }, { status: 403 })));
    await expect(getMemberPage(async () => "token")).rejects.toThrow("沒有會員管理權限");
  });
});

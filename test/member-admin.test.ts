import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import admin from "../api/admin";
import member from "../api/member";

const mocks = vi.hoisted(() => ({ verify: vi.fn(), getUser: vi.fn(), list: vi.fn(), ban: vi.fn(), unban: vi.fn(), sql: vi.fn() }));
vi.mock("@clerk/backend", () => ({ verifyToken: mocks.verify, createClerkClient: () => ({ users: { getUser: mocks.getUser, getUserList: mocks.list, banUser: mocks.ban, unbanUser: mocks.unban } }) }));
vi.mock("@neondatabase/serverless", () => ({ neon: () => ({ query: mocks.sql }) }));

const user = (id = "user_member", extra = {}) => ({ id, firstName: "旅人", lastName: null, primaryEmailAddressId: "email_1", emailAddresses: [{ id: "email_1", emailAddress: "member@example.test", verification: { status: "verified" } }], createdAt: 1730000000000, lastSignInAt: null, banned: false, privateMetadata: {}, ...extra });

async function call(handler = admin, options: { method?: string; token?: string | null; query?: unknown; body?: unknown } = {}) {
  const headers: Record<string, string> = {};
  let status = 200, body: unknown;
  const response = { setHeader(name: string, value: string) { headers[name] = value; }, status(code: number) { status = code; return this; }, json(value: unknown) { body = value; return this; } };
  await handler({ method: options.method ?? "GET", headers: options.token === null ? {} : { authorization: `Bearer ${options.token ?? "user_admin"}` }, query: options.query ?? {}, body: options.body } as never, response as never);
  return { status, body: body as Record<string, unknown>, headers };
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("CLERK_SECRET_KEY", "sk_test_fixture"); vi.stubEnv("DATABASE_URL", "test-db"); vi.stubEnv("MEMBER_ADMIN_USER_IDS", "user_admin");
  mocks.verify.mockImplementation(async token => ({ sub: token, azp: "https://deep-space-ledger-app.vercel.app" }));
  mocks.getUser.mockImplementation(async id => user(id));
  mocks.list.mockResolvedValue({ data: [user()], totalCount: 1 });
  mocks.sql.mockImplementation(async (query: string) => query.startsWith("INSERT") ? [{ id: "42" }] : []);
  mocks.ban.mockResolvedValue(user("user_member", { banned: true })); mocks.unban.mockResolvedValue(user());
});
afterEach(() => vi.unstubAllEnvs());

describe("member and administrator authorization", () => {
  it("rejects an unsigned request before calling either service", async () => {
    expect((await call(admin, { token: null })).status).toBe(401);
    expect((await call(member, { token: null })).status).toBe(401);
    expect(mocks.getUser).not.toHaveBeenCalled(); expect(mocks.sql).not.toHaveBeenCalled();
  });
  it("rejects a tampered token and an untrusted browser origin", async () => {
    mocks.verify.mockRejectedValueOnce(new Error("invalid signature"));
    expect((await call()).status).toBe(401);
    mocks.verify.mockResolvedValueOnce({ sub: "user_admin", azp: "https://untrusted.example" });
    expect((await call()).status).toBe(401); expect(mocks.list).not.toHaveBeenCalled();
  });
  it("does not accept client-writable metadata as an admin role", async () => {
    mocks.getUser.mockResolvedValue(user("user_member", { unsafeMetadata: { ladRole: "admin" }, publicMetadata: { isAdmin: true } }));
    const result = await call(admin, { token: "user_member" });
    expect(result.status).toBe(403); expect(mocks.sql).not.toHaveBeenCalled(); expect(mocks.list).not.toHaveBeenCalled();
  });
  it("supports a private server-assigned admin role without an allowlist", async () => {
    vi.stubEnv("MEMBER_ADMIN_USER_IDS", "");
    mocks.getUser.mockResolvedValue(user("user_privateAdmin", { privateMetadata: { ladRole: "admin", unrelatedSecret: "do-not-serialize" } }));
    const result = await call(member, { token: "user_privateAdmin" });
    expect(result.body).toEqual({ userId: "user_privateAdmin", isAdmin: true });
  });
  it("rejects suspended accounts even while an old signed JWT has not expired", async () => {
    mocks.getUser.mockResolvedValue(user("user_admin", { banned: true }));
    expect((await call()).status).toBe(401); expect(mocks.list).not.toHaveBeenCalled();
  });
  it("returns no public admin by default and fails closed when membership is unavailable", async () => {
    vi.stubEnv("MEMBER_ADMIN_USER_IDS", "");
    expect((await call(member, { token: "user_member" })).body).toEqual({ userId: "user_member", isAdmin: false });
    mocks.getUser.mockRejectedValue(new Error("provider unavailable"));
    expect((await call()).status).toBe(503); expect(mocks.list).not.toHaveBeenCalled();
  });
});

describe("administrator read and action boundaries", () => {
  it("paginates on the server and sends only management fields and backup metadata", async () => {
    mocks.list.mockResolvedValue({ data: [user("user_member", { privateMetadata: { secret: "private" }, unsafeMetadata: { a: 1 } })], totalCount: 41 });
    mocks.sql.mockImplementation(async (query: string) => query.startsWith("SELECT user_id") ? [{ user_id: "user_member", revision: "3", updated_at: "2026-11-12T00:00:00Z", data: { privateBudget: 1234 } }] : []);
    const result = await call(admin, { query: { search: "旅人", offset: "20" } });
    expect(result.status).toBe(200); expect(result.headers["Cache-Control"]).toBe("private, no-store");
    expect(mocks.list).toHaveBeenCalledWith({ limit: 20, offset: 20, orderBy: "-created_at", query: "旅人" });
    expect(JSON.stringify(result.body)).not.toMatch(/privateBudget|privateMetadata|unsafeMetadata/);
    expect(result.body).toMatchObject({ totalCount: 41, offset: 20, members: [{ backup: { revision: 3 } }] });
    expect(mocks.sql.mock.calls[0][0]).not.toMatch(/SELECT.*\bdata\b/);
  });
  it.each([{ offset: "-1" }, { offset: "1e6" }, { offset: "1000001" }, { search: ["a", "b"] }, { search: "x".repeat(121) }])("rejects invalid query %j", async query => {
    expect((await call(admin, { query })).status).toBe(400); expect(mocks.list).not.toHaveBeenCalled();
  });
  it("records the actor, reason and result around the provider change", async () => {
    const result = await call(admin, { method: "POST", body: { userId: "user_member", action: "ban", reason: " 重複濫用 " } });
    expect(result.status).toBe(200); expect(result.body).toMatchObject({ member: { id: "user_member", banned: true }, auditPending: false });
    expect(mocks.sql).toHaveBeenNthCalledWith(1, expect.stringContaining("INSERT INTO lad_member_audit"), ["user_admin", "user_member", "ban", "重複濫用"]);
    expect(mocks.sql.mock.invocationCallOrder[0]).toBeLessThan(mocks.ban.mock.invocationCallOrder[0]);
    expect(mocks.sql).toHaveBeenLastCalledWith("UPDATE lad_member_audit SET result = 'succeeded' WHERE id = $1", ["42"]);
  });
  it("restores an account through the provider without rewriting its backup", async () => {
    expect((await call(admin, { method: "POST", body: { userId: "user_member", action: "unban", reason: "已確認恢復" } })).status).toBe(200);
    expect(mocks.unban).toHaveBeenCalledWith("user_member"); expect(mocks.ban).not.toHaveBeenCalled();
    expect(mocks.sql.mock.calls.map(([q]) => q).join(" ")).not.toContain("lad_cloud_snapshots");
  });
  it.each(["user_admin", "user_privateAdmin"])("protects administrator %s", async userId => {
    mocks.getUser.mockImplementation(async id => user(id, id === "user_privateAdmin" ? { privateMetadata: { ladRole: "admin" } } : {}));
    expect((await call(admin, { method: "POST", body: { userId, action: "ban", reason: "不應允許" } })).status).toBe(403);
    expect(mocks.ban).not.toHaveBeenCalled(); expect(mocks.sql).not.toHaveBeenCalled();
  });
  it.each([{ action: "delete", userId: "user_member", reason: "不能刪除" }, { action: "ban", userId: "user_member", reason: " " }, { action: "ban", userId: "not-a-user", reason: "不能操作" }])("rejects invalid mutation %j", async body => {
    expect((await call(admin, { method: "POST", body })).status).toBe(400); expect(mocks.ban).not.toHaveBeenCalled();
  });
  it("does not mutate a member if the audit intent cannot be stored", async () => {
    mocks.sql.mockRejectedValue(new Error("database down"));
    expect((await call(admin, { method: "POST", body: { userId: "user_member", action: "ban", reason: "測試保存" } })).status).toBe(503);
    expect(mocks.ban).not.toHaveBeenCalled();
  });
  it("retains a failed action in the audit trail without exposing provider internals", async () => {
    mocks.ban.mockRejectedValue(new Error("internal secret"));
    const result = await call(admin, { method: "POST", body: { userId: "user_member", action: "ban", reason: "測試失敗" } });
    expect(result.status).toBe(503); expect(JSON.stringify(result.body)).not.toContain("internal secret");
    expect(mocks.sql).toHaveBeenLastCalledWith("UPDATE lad_member_audit SET result = 'failed' WHERE id = $1", ["42"]);
  });
  it("reports a successful mutation honestly if final audit confirmation is unavailable", async () => {
    mocks.sql.mockImplementation(async (query: string) => { if (query.startsWith("INSERT")) return [{ id: "42" }]; throw new Error("connection closed"); });
    const result = await call(admin, { method: "POST", body: { userId: "user_member", action: "ban", reason: "測試完成" } });
    expect(result.status).toBe(200); expect(result.body.auditPending).toBe(true); expect(mocks.ban).toHaveBeenCalledOnce();
  });
});

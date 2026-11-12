import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import handler from "../api/sync";

const mocks = vi.hoisted(() => ({ verify: vi.fn(), getUser: vi.fn(), sql: vi.fn() }));
vi.mock("@clerk/backend", () => ({ verifyToken: mocks.verify, createClerkClient: () => ({ users: { getUser: mocks.getUser } }) }));
vi.mock("@neondatabase/serverless", () => ({ neon: () => ({ query: mocks.sql }) }));
const data = { budgets: {}, expenses: [], calculator: null };

async function call(method: string, body?: unknown) {
  let status = 200, result: unknown;
  const response = { setHeader() {}, status(code: number) { status = code; return this; }, json(value: unknown) { result = value; return this; }, end() { return this; } };
  await handler({ method, headers: { authorization: "Bearer valid-session" }, body } as never, response as never);
  return { status, result };
}
beforeEach(() => {
  vi.resetAllMocks(); vi.stubEnv("CLERK_SECRET_KEY", "sk_test_fixture"); vi.stubEnv("DATABASE_URL", "test-db");
  mocks.verify.mockResolvedValue({ sub: "user_owner" }); mocks.getUser.mockResolvedValue({ id: "user_owner", banned: false }); mocks.sql.mockResolvedValue([]);
});
afterEach(() => vi.unstubAllEnvs());

describe("member backup isolation and revision safety", () => {
  it("reads only the verified member's backup even if the client names someone else", async () => {
    mocks.sql.mockImplementation(async (query: string) => query.startsWith("SELECT") ? [{ data, revision: 3, updated_at: "2026-11-12T00:00:00Z" }] : []);
    const result = await call("GET", { userId: "user_victim" });
    expect(result.status).toBe(200); expect(result.result).toMatchObject({ revision: 3 });
    expect(mocks.sql).toHaveBeenLastCalledWith("SELECT data, revision, updated_at FROM lad_cloud_snapshots WHERE user_id = $1", ["user_owner"]);
  });
  it("deletes only the verified member's backup", async () => {
    expect((await call("DELETE", { userId: "user_victim" })).status).toBe(204);
    expect(mocks.sql).toHaveBeenLastCalledWith("DELETE FROM lad_cloud_snapshots WHERE user_id = $1", ["user_owner"]);
  });
  it("blocks a suspended member before any database operation", async () => {
    mocks.getUser.mockResolvedValue({ id: "user_owner", banned: true });
    expect((await call("PUT", { expectedRevision: 0, data })).status).toBe(401); expect(mocks.sql).not.toHaveBeenCalled();
  });
  it("rejects a deleted member instead of treating an old token as an active account", async () => {
    mocks.getUser.mockRejectedValue({ status: 404 });
    expect((await call("GET")).status).toBe(401); expect(mocks.sql).not.toHaveBeenCalled();
  });
  it("reports an unavailable membership provider without writing or pretending the session expired", async () => {
    mocks.getUser.mockRejectedValue(new Error("provider down"));
    expect((await call("GET")).status).toBe(503); expect(mocks.sql).not.toHaveBeenCalled();
  });
  it("does not recreate a removed backup during a stale update", async () => {
    const result = await call("PUT", { expectedRevision: 3, data });
    expect(result.status).toBe(409);
    const [statement, parameters] = mocks.sql.mock.calls.at(-1)!;
    expect(statement).toMatch(/^UPDATE/); expect(statement).not.toMatch(/INSERT/);
    expect(parameters).toEqual(["user_owner", expect.any(String), 3]);
  });
  it("creates only at revision zero and never overwrites a conflicting existing row", async () => {
    expect((await call("PUT", { expectedRevision: 0, data, userId: "user_victim" })).status).toBe(409);
    const [statement, parameters] = mocks.sql.mock.calls.at(-1)!;
    expect(statement).toContain("ON CONFLICT (user_id) DO NOTHING");
    expect(parameters[0]).toBe("user_owner");
  });
  it("rejects a negative revision before running a data mutation", async () => {
    expect((await call("PUT", { expectedRevision: -1, data })).status).toBe(400);
    expect(mocks.sql.mock.calls.some(([statement]) => /^(INSERT|UPDATE|DELETE)/.test(statement))).toBe(false);
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import handler from "../api/account";
import { AppleGrantError } from "../api/_lib/appleRevocation";

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), deleteUser: vi.fn(), getUserOauthAccessToken: vi.fn(), sql: vi.fn(), nativeRevocation: vi.fn(), readConfig: vi.fn(), webRevocation: vi.fn() }));
vi.mock("@clerk/backend", () => ({ createClerkClient: () => ({ users: { getUser: mocks.getUser, deleteUser: mocks.deleteUser, getUserOauthAccessToken: mocks.getUserOauthAccessToken } }) }));
vi.mock("@neondatabase/serverless", () => ({ neon: () => ({ query: mocks.sql }) }));
vi.mock("../api/_lib/requestAuth", async (importOriginal) => ({ ...await importOriginal<typeof import("../api/_lib/requestAuth")>(), userIdFromRequest: async () => "authenticated-owner" }));
vi.mock("../api/_lib/appleRevocation", async (importOriginal) => ({ ...await importOriginal<typeof import("../api/_lib/appleRevocation")>(), revokeNativeAppleAuthorization: mocks.nativeRevocation, readAppleRevocationConfig: mocks.readConfig, revokeAppleToken: mocks.webRevocation }));

async function deleteAccount(body?: unknown) {
  let statusCode = 200;
  let responseBody: unknown;
  const response = { setHeader() {}, status(code: number) { statusCode = code; return this; }, json(value: unknown) { responseBody = value; return this; } };
  await handler({ method: "DELETE", headers: { authorization: "Bearer test-session" }, body } as never, response as never);
  return { statusCode, body: responseBody };
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("CLERK_SECRET_KEY", "test-secret");
  vi.stubEnv("DATABASE_URL", "test-db");
  mocks.getUser.mockResolvedValue({ externalAccounts: [{ provider: "oauth_apple", providerUserId: "apple-owner" }] });
  mocks.readConfig.mockReturnValue({ nativeClientId: "com.example.app" });
  mocks.sql.mockResolvedValue([]);
});
afterEach(() => vi.unstubAllEnvs());

describe("authenticated deletion and Apple ownership", () => {
  it("binds the fresh grant to the authenticated member and revokes before removing their data", async () => {
    expect(await deleteAccount({ appleAuthorizationCode: "fresh-code" })).toEqual({ statusCode: 200, body: { deleted: true, appleAuthorization: "revoked" } });
    expect(mocks.nativeRevocation).toHaveBeenCalledWith("fresh-code", ["apple-owner"], expect.any(Object));
    expect(mocks.nativeRevocation.mock.invocationCallOrder[0]).toBeLessThan(mocks.sql.mock.invocationCallOrder[0]);
    expect(mocks.sql).toHaveBeenCalledWith("DELETE FROM lad_cloud_snapshots WHERE user_id = $1", ["authenticated-owner"]);
    expect(mocks.deleteUser).toHaveBeenCalledWith("authenticated-owner");
    expect(mocks.getUserOauthAccessToken).not.toHaveBeenCalled();
  });
  it.each([["apple_grant_invalid", 403], ["apple_revocation_unavailable", 503]] as const)("preserves all data and sanitizes %s failures", async (code, status) => {
    mocks.nativeRevocation.mockRejectedValue(new AppleGrantError(code));
    expect(await deleteAccount({ appleAuthorizationCode: "fresh-code" })).toEqual({ statusCode: status, body: { error: code } });
    expect(mocks.sql).not.toHaveBeenCalled();
    expect(mocks.deleteUser).not.toHaveBeenCalled();
  });
  it("rejects Apple credentials for an account without an Apple connection", async () => {
    mocks.getUser.mockResolvedValue({ externalAccounts: [] });
    expect((await deleteAccount({ appleAuthorizationCode: "other-code" })).statusCode).toBe(403);
    expect(mocks.nativeRevocation).not.toHaveBeenCalled();
    expect(mocks.deleteUser).not.toHaveBeenCalled();
    expect(mocks.sql).not.toHaveBeenCalled();
  });
  it("retains deletion access for native old clients or users who explicitly skip Apple verification", async () => {
    mocks.getUserOauthAccessToken.mockRejectedValue({ errors: [{ code: "oauth_missing_refresh_token" }] });
    expect(await deleteAccount()).toEqual({ statusCode: 200, body: { deleted: true, appleAuthorization: "manual_required" } });
    expect(mocks.deleteUser).toHaveBeenCalledWith("authenticated-owner");
  });
  it("preserves the existing Web Apple token path", async () => {
    mocks.getUserOauthAccessToken.mockResolvedValue({ data: [{ token: "web-access" }] });
    mocks.webRevocation.mockResolvedValue(true);
    expect((await deleteAccount()).body).toEqual({ deleted: true, appleAuthorization: "revoked" });
    expect(mocks.webRevocation).toHaveBeenCalledWith("web-access", expect.any(Object));
  });
  it("keeps Email account deletion independent of Apple configuration", async () => {
    mocks.getUser.mockResolvedValue({ externalAccounts: [] });
    mocks.readConfig.mockReturnValue(null);
    expect((await deleteAccount()).body).toEqual({ deleted: true, appleAuthorization: "not_connected" });
    expect(mocks.deleteUser).toHaveBeenCalledWith("authenticated-owner");
  });
  it("rejects a malformed code before any destructive operation", async () => {
    expect((await deleteAccount({ appleAuthorizationCode: 42 })).statusCode).toBe(403);
    expect(mocks.getUser).not.toHaveBeenCalled();
    expect(mocks.deleteUser).not.toHaveBeenCalled();
    expect(mocks.sql).not.toHaveBeenCalled();
  });
});

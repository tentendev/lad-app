import { beforeEach, describe, expect, it, vi } from "vitest";
import { isAppleAuthorizationRevoked, requestAppleDeletionCredential } from "../src/auth/nativeAppleDeletion";

const apple = vi.hoisted(() => ({ signInAsync: vi.fn(), getCredentialStateAsync: vi.fn() }));
vi.mock("expo-apple-authentication", () => ({ ...apple, AppleAuthenticationCredentialState: { REVOKED: 0, AUTHORIZED: 1, NOT_FOUND: 2, TRANSFERRED: 3 } }));

beforeEach(() => vi.resetAllMocks());

describe("native Apple deletion verification", () => {
  it("keeps only the transient code and subject needed for deletion and the device credential check", async () => {
    apple.signInAsync.mockResolvedValue({ authorizationCode: "one-use-code", user: "apple-user", identityToken: "private-id-token", email: "private-email" });
    await expect(requestAppleDeletionCredential()).resolves.toEqual({ authorizationCode: "one-use-code", user: "apple-user" });
    expect(apple.signInAsync).toHaveBeenCalledWith({ requestedScopes: [] });
  });
  it("propagates cancellation rather than presenting an absent code as authorization", async () => {
    apple.signInAsync.mockRejectedValue({ code: "ERR_REQUEST_CANCELED" });
    await expect(requestAppleDeletionCredential()).rejects.toMatchObject({ code: "ERR_REQUEST_CANCELED" });
  });
  it("rejects an incomplete credential", async () => {
    apple.signInAsync.mockResolvedValue({ authorizationCode: null, user: "apple-user" });
    await expect(requestAppleDeletionCredential()).rejects.toThrow("incomplete");
  });
  it.each([[0, true], [1, false], [2, true], [3, false]])("checks actual Apple credential state %s independently of server HTTP success", async (state, expected) => {
    apple.getCredentialStateAsync.mockResolvedValue(state);
    await expect(isAppleAuthorizationRevoked("apple-user")).resolves.toBe(expected);
  });
  it("does not claim revocation when the device check is unavailable", async () => {
    apple.getCredentialStateAsync.mockRejectedValue(new Error("offline"));
    await expect(isAppleAuthorizationRevoked("apple-user")).resolves.toBe(false);
  });
});

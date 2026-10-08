import { generateKeyPairSync } from "node:crypto";
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from "jose";
import { describe, expect, it, vi } from "vitest";
import { AppleGrantError, appleAuthorizationCodeFromBody, revokeNativeAppleAuthorization, verifyAppleIdentityToken } from "../api/_lib/appleRevocation";
import type { AppleRevocationConfig } from "../api/_lib/appleRevocation";

const signingKeys = await generateKeyPair("RS256");
const publicKeys = createLocalJWKSet({ keys: [{ ...await exportJWK(signingKeys.publicKey), kid: "apple-test-key", alg: "RS256" }] });

async function identityToken(overrides: Record<string, unknown> = {}) {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ iss: "https://appleid.apple.com", aud: "com.example.app", sub: "apple-owner", iat: now, exp: now + 300, ...overrides })
    .setProtectedHeader({ alg: "RS256", kid: "apple-test-key" }).sign(signingKeys.privateKey);
}

function nativeConfig(): AppleRevocationConfig {
  const { privateKey } = generateKeyPairSync("ec", { namedCurve: "P-256" });
  return { teamId: "TEAM123456", keyId: "KEY1234567", privateKey: privateKey.export({ type: "pkcs8", format: "pem" }).toString(), clientIds: ["com.example.app", "com.example.web"], nativeClientId: "com.example.app" };
}

describe("fresh native Apple grant", () => {
  it("exchanges a code, validates Apple's signed identity and revokes its refresh token using the native client only", async () => {
    const fetchDouble = vi.fn()
      .mockResolvedValueOnce(Response.json({ id_token: await identityToken(), refresh_token: "new-refresh", access_token: "new-access" }))
      .mockResolvedValueOnce(new Response(null, { status: 200 }));
    await expect(revokeNativeAppleAuthorization("single-use-code", ["apple-owner"], nativeConfig(), fetchDouble, publicKeys)).resolves.toBeUndefined();
    const [exchange, revoke] = fetchDouble.mock.calls;
    expect(exchange[0]).toBe("https://appleid.apple.com/auth/token");
    const exchangeBody = new URLSearchParams(exchange[1].body);
    expect(exchangeBody.get("code")).toBe("single-use-code");
    expect(exchangeBody.get("grant_type")).toBe("authorization_code");
    expect(exchangeBody.get("client_id")).toBe("com.example.app");
    expect(exchangeBody.has("redirect_uri")).toBe(false);
    expect(revoke[0]).toBe("https://appleid.apple.com/auth/revoke");
    const revokeBody = new URLSearchParams(revoke[1].body);
    expect(revokeBody.get("token")).toBe("new-refresh");
    expect(revokeBody.get("token_type_hint")).toBe("refresh_token");
    expect(revokeBody.get("client_id")).toBe("com.example.app");
  });

  it.each([{ sub: "another-apple-user" }, { aud: "com.example.web" }, { iss: "https://attacker.example" }, { exp: 1 }, { iat: 1 }, { sub: undefined }])("never revokes a grant with invalid or mismatched identity claims: %j", async (claims) => {
    const fetchDouble = vi.fn().mockResolvedValueOnce(Response.json({ id_token: await identityToken(claims), refresh_token: "another-refresh" }));
    await expect(revokeNativeAppleAuthorization("code", ["apple-owner"], nativeConfig(), fetchDouble, publicKeys)).rejects.toMatchObject({ code: "apple_grant_invalid" });
    expect(fetchDouble).toHaveBeenCalledTimes(1);
  });

  it("rejects a forged signature even when every claim matches", async () => {
    const otherKeys = await generateKeyPair("RS256");
    const now = Math.floor(Date.now() / 1000);
    const forged = await new SignJWT({ iss: "https://appleid.apple.com", aud: "com.example.app", sub: "apple-owner", iat: now, exp: now + 300 })
      .setProtectedHeader({ alg: "RS256", kid: "apple-test-key" }).sign(otherKeys.privateKey);
    await expect(verifyAppleIdentityToken(forged, "com.example.app", ["apple-owner"], publicKeys)).rejects.toBeInstanceOf(AppleGrantError);
  });

  it("does not treat HTTP 200 without tokens as a valid grant", async () => {
    const fetchDouble = vi.fn().mockResolvedValueOnce(Response.json({}));
    await expect(revokeNativeAppleAuthorization("code", ["apple-owner"], nativeConfig(), fetchDouble, publicKeys)).rejects.toMatchObject({ code: "apple_revocation_unavailable" });
    expect(fetchDouble).toHaveBeenCalledTimes(1);
  });

  it("does not report revocation success when Apple rejects the exchanged refresh token", async () => {
    const fetchDouble = vi.fn()
      .mockResolvedValueOnce(Response.json({ id_token: await identityToken(), refresh_token: "refresh" }))
      .mockResolvedValueOnce(new Response(null, { status: 400 }));
    await expect(revokeNativeAppleAuthorization("code", ["apple-owner"], nativeConfig(), fetchDouble, publicKeys)).rejects.toMatchObject({ code: "apple_revocation_unavailable" });
    expect(fetchDouble).toHaveBeenCalledTimes(2);
  });

  it.each([400, 500])("never proceeds past a failed code exchange (%s)", async (status) => {
    const fetchDouble = vi.fn().mockResolvedValueOnce(new Response(null, { status }));
    await expect(revokeNativeAppleAuthorization("code", ["apple-owner"], nativeConfig(), fetchDouble, publicKeys)).rejects.toMatchObject({ code: status === 400 ? "apple_grant_invalid" : "apple_revocation_unavailable" });
    expect(fetchDouble).toHaveBeenCalledTimes(1);
  });

  it.each([{ subjects: [] }, { subjects: ["unrelated-subject"] }])("requires a known Apple account subject: %j", async ({ subjects }) => {
    const fetchDouble = vi.fn().mockResolvedValueOnce(Response.json({ id_token: await identityToken(), refresh_token: "refresh" }));
    await expect(revokeNativeAppleAuthorization("code", subjects, nativeConfig(), fetchDouble, publicKeys)).rejects.toMatchObject({ code: "apple_grant_invalid" });
    expect(fetchDouble.mock.calls.length).toBeLessThanOrEqual(1);
  });

  it("fails closed if the native client is not configured", async () => {
    const fetchDouble = vi.fn();
    await expect(revokeNativeAppleAuthorization("code", ["apple-owner"], { ...nativeConfig(), nativeClientId: undefined }, fetchDouble, publicKeys)).rejects.toMatchObject({ code: "apple_revocation_unavailable" });
    expect(fetchDouble).not.toHaveBeenCalled();
  });
});

describe("Apple deletion request validation", () => {
  it("supports old clients without a body and a bounded JSON grant", () => {
    expect(appleAuthorizationCodeFromBody(undefined)).toBeUndefined();
    expect(appleAuthorizationCodeFromBody({})).toBeUndefined();
    expect(appleAuthorizationCodeFromBody('{"appleAuthorizationCode":"code"}')).toBe("code");
  });
  it.each([[], "invalid-json", { appleAuthorizationCode: 42 }, { appleAuthorizationCode: "" }, { appleAuthorizationCode: "a".repeat(4097) }])("rejects malformed grants: %j", (body) => {
    expect(() => appleAuthorizationCodeFromBody(body)).toThrow(AppleGrantError);
  });
});

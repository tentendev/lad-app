import { Buffer } from "node:buffer";
import { generateKeyPairSync, verify } from "node:crypto";
import { describe, expect, it } from "vitest";

import { createAppleClientSecret, revokeAppleToken } from "../api/_lib/appleRevocation";
import type { AppleRevocationConfig } from "../api/_lib/appleRevocation";

describe("Sign in with Apple revocation", () => {
  it("creates a short-lived ES256 client secret with Apple's required claims", async () => {
    const { privateKey, publicKey } = generateKeyPairSync("ec", { namedCurve: "P-256" });
    const config: AppleRevocationConfig = {
      teamId: "TEAM123456",
      keyId: "KEY1234567",
      privateKey: privateKey.export({ type: "pkcs8", format: "pem" }).toString(),
      clientIds: ["com.example.app"],
    };
    const token = await createAppleClientSecret(config, "com.example.app", 1_800_000_000);
    const [encodedHeader, encodedPayload, encodedSignature] = token.split(".");
    const header = JSON.parse(Buffer.from(encodedHeader, "base64url").toString("utf8"));
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    const valid = verify("sha256", Buffer.from(`${encodedHeader}.${encodedPayload}`), {
      key: publicKey,
      dsaEncoding: "ieee-p1363",
    }, Buffer.from(encodedSignature, "base64url"));
    expect(valid).toBe(true);
    expect(header).toEqual({
      alg: "ES256",
      kid: "KEY1234567",
    });
    expect(payload).toMatchObject({
      aud: "https://appleid.apple.com",
      iss: "TEAM123456",
      sub: "com.example.app",
      iat: 1_800_000_000,
      exp: 1_800_000_300,
    });
  });

  it("tries each configured native or web client ID with Apple's form contract", async () => {
    const { privateKey } = generateKeyPairSync("ec", { namedCurve: "P-256" });
    const config: AppleRevocationConfig = {
      teamId: "TEAM123456",
      keyId: "KEY1234567",
      privateKey: privateKey.export({ type: "pkcs8", format: "pem" }).toString(),
      clientIds: ["com.example.app", "com.example.web"],
    };
    const calls: URLSearchParams[] = [];
    const fetchDouble = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      calls.push(new URLSearchParams(String(init?.body)));
      return new Response(null, { status: calls.length === 1 ? 400 : 200 });
    }) as typeof fetch;

    await expect(revokeAppleToken("private-user-token", config, fetchDouble)).resolves.toBe(true);
    expect(calls.map((body) => body.get("client_id"))).toEqual(["com.example.app", "com.example.web"]);
    expect(calls.every((body) => body.get("token") === "private-user-token")).toBe(true);
  });
});

import { Buffer } from "node:buffer";
import { createPrivateKey, sign } from "node:crypto";
import type { JWTVerifyGetKey } from "jose";

const APPLE_AUDIENCE = "https://appleid.apple.com";
const APPLE_REVOKE_URL = "https://appleid.apple.com/auth/revoke";
const APPLE_TOKEN_URL = "https://appleid.apple.com/auth/token";
let applePublicKeys: JWTVerifyGetKey | undefined;

export type AppleRevocationConfig = {
  teamId: string;
  keyId: string;
  privateKey: string;
  clientIds: string[];
  nativeClientId?: string;
};

export class AppleGrantError extends Error {
  constructor(readonly code: "apple_grant_invalid" | "apple_revocation_unavailable") {
    super(code);
  }
}

function configured(name: string): string {
  return process.env[name]?.trim() ?? "";
}

export function readAppleRevocationConfig(): AppleRevocationConfig | null {
  const teamId = configured("APPLE_TEAM_ID");
  const keyId = configured("APPLE_KEY_ID");
  const privateKey = configured("APPLE_PRIVATE_KEY").replace(/\\n/g, "\n");
  const clientIds = [...new Set([
    configured("APPLE_NATIVE_CLIENT_ID"),
    configured("APPLE_WEB_CLIENT_ID"),
  ].filter(Boolean))];
  if (!teamId || !keyId || !privateKey || clientIds.length === 0) return null;
  return { teamId, keyId, privateKey, clientIds, nativeClientId: configured("APPLE_NATIVE_CLIENT_ID") || undefined };
}

export function appleAuthorizationCodeFromBody(body: unknown): string | undefined {
  if (body === undefined || body === null || body === "") return undefined;
  if (typeof body === "string") {
    if (body.length > 8_192) throw new AppleGrantError("apple_grant_invalid");
    try { body = JSON.parse(body); } catch { throw new AppleGrantError("apple_grant_invalid"); }
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) throw new AppleGrantError("apple_grant_invalid");
  const code = (body as Record<string, unknown>).appleAuthorizationCode;
  if (code === undefined) return undefined;
  if (typeof code !== "string" || !code.trim() || code.length > 4_096) throw new AppleGrantError("apple_grant_invalid");
  return code;
}

export async function verifyAppleIdentityToken(
  token: string,
  clientId: string,
  expectedSubjects: string[],
  publicKeys?: JWTVerifyGetKey,
): Promise<void> {
  // Vercel's CommonJS launcher cannot require ESM-only packages, even on
  // Node 24. Native import() is preserved by the server's NodeNext compiler.
  const { createRemoteJWKSet, jwtVerify } = await import("jose");
  applePublicKeys ??= createRemoteJWKSet(new URL(`${APPLE_AUDIENCE}/auth/keys`), { timeoutDuration: 5_000 });
  try {
    const { payload } = await jwtVerify(token, publicKeys ?? applePublicKeys, {
      algorithms: ["RS256"],
      issuer: APPLE_AUDIENCE,
      audience: clientId,
      requiredClaims: ["sub", "exp", "iat"],
      maxTokenAge: "10m",
    });
    if (!payload.sub || !expectedSubjects.includes(payload.sub)) throw new Error("subject_mismatch");
  } catch {
    throw new AppleGrantError("apple_grant_invalid");
  }
}

export async function createAppleClientSecret(
  config: AppleRevocationConfig,
  clientId: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): Promise<string> {
  const encodedHeader = Buffer.from(JSON.stringify({
    alg: "ES256",
    kid: config.keyId,
  })).toString("base64url");
  const encodedPayload = Buffer.from(JSON.stringify({
    iss: config.teamId,
    sub: clientId,
    aud: APPLE_AUDIENCE,
    iat: nowSeconds,
    exp: nowSeconds + 300,
  })).toString("base64url");
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = sign("sha256", Buffer.from(signingInput), {
    key: createPrivateKey(config.privateKey),
    dsaEncoding: "ieee-p1363",
  });
  return `${signingInput}.${signature.toString("base64url")}`;
}

export async function revokeAppleToken(
  token: string,
  config: AppleRevocationConfig,
  fetchImpl: typeof fetch = fetch,
): Promise<boolean> {
  for (const clientId of config.clientIds) {
    if (await revokeTokenForClient(token, config, clientId, "access_token", fetchImpl)) return true;
  }
  return false;
}

async function revokeTokenForClient(
  token: string,
  config: AppleRevocationConfig,
  clientId: string,
  tokenType: "access_token" | "refresh_token",
  fetchImpl: typeof fetch,
): Promise<boolean> {
  try {
    const clientSecret = await createAppleClientSecret(config, clientId);
    const response = await fetchImpl(APPLE_REVOKE_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      signal: AbortSignal.timeout(5_000),
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        token,
        token_type_hint: tokenType,
      }).toString(),
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Native Clerk sign-in retains the ID token, not an Apple OAuth grant. Obtain a
// fresh grant only for deletion; keep its credentials in memory and bind Apple's
// signed subject to the authenticated Clerk user's existing Apple account.
export async function revokeNativeAppleAuthorization(
  authorizationCode: string,
  expectedSubjects: string[],
  config: AppleRevocationConfig,
  fetchImpl: typeof fetch = fetch,
  publicKeys?: JWTVerifyGetKey,
): Promise<void> {
  const clientId = config.nativeClientId;
  if (!clientId) throw new AppleGrantError("apple_revocation_unavailable");
  if (!expectedSubjects.length) throw new AppleGrantError("apple_grant_invalid");
  let response: Response;
  let grant: Record<string, unknown>;
  try {
    const clientSecret = await createAppleClientSecret(config, clientId);
    response = await fetchImpl(APPLE_TOKEN_URL, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
      signal: AbortSignal.timeout(5_000),
      body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, code: authorizationCode, grant_type: "authorization_code" }).toString(),
    });
    if (!response.ok) {
      throw new AppleGrantError(response.status >= 500 || response.status === 429 ? "apple_revocation_unavailable" : "apple_grant_invalid");
    }
    grant = await response.json();
    if (!grant || typeof grant.id_token !== "string" || typeof grant.refresh_token !== "string" || !grant.refresh_token) {
      throw new AppleGrantError("apple_revocation_unavailable");
    }
  } catch (error) {
    if (error instanceof AppleGrantError) throw error;
    throw new AppleGrantError("apple_revocation_unavailable");
  }
  await verifyAppleIdentityToken(grant.id_token as string, clientId, expectedSubjects, publicKeys);
  if (!await revokeTokenForClient(grant.refresh_token as string, config, clientId, "refresh_token", fetchImpl)) {
    throw new AppleGrantError("apple_revocation_unavailable");
  }
}

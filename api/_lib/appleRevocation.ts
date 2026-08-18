import { Buffer } from "node:buffer";
import { createPrivateKey, sign } from "node:crypto";

const APPLE_AUDIENCE = "https://appleid.apple.com";
const APPLE_REVOKE_URL = "https://appleid.apple.com/auth/revoke";

export type AppleRevocationConfig = {
  teamId: string;
  keyId: string;
  privateKey: string;
  clientIds: string[];
};

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
  return { teamId, keyId, privateKey, clientIds };
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
    const clientSecret = await createAppleClientSecret(config, clientId);
    let response: Response;
    try {
      response = await fetchImpl(APPLE_REVOKE_URL, {
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
          token_type_hint: "access_token",
        }).toString(),
      });
    } catch {
      continue;
    }
    if (response.ok) return true;
  }
  return false;
}

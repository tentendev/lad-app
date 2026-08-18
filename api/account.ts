import { createClerkClient } from "@clerk/backend";
import { neon } from "@neondatabase/serverless";
import type { VercelRequest, VercelResponse } from "@vercel/node";

import { readAppleRevocationConfig, revokeAppleToken } from "./_lib/appleRevocation";
import { AuthenticationError, requiredServerEnvironment, userIdFromRequest } from "./_lib/requestAuth";

type AppleAuthorization = "not_connected" | "revoked" | "manual_required";

function isAppleProvider(provider: string): boolean {
  return provider.toLowerCase().replace(/^oauth_/, "") === "apple";
}

async function revokeAppleAuthorization(
  userId: string,
  clerk: ReturnType<typeof createClerkClient>,
): Promise<AppleAuthorization> {
  const user = await clerk.users.getUser(userId);
  if (!user.externalAccounts.some((account) => isAppleProvider(account.provider))) return "not_connected";

  const config = readAppleRevocationConfig();
  if (!config) return "manual_required";

  try {
    const page = await clerk.users.getUserOauthAccessToken(userId, "apple");
    if (page.data.length === 0) return "manual_required";
    const results = await Promise.all(page.data.map((credential) => revokeAppleToken(credential.token, config)));
    return results.every(Boolean) ? "revoked" : "manual_required";
  } catch {
    return "manual_required";
  }
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader("Cache-Control", "private, no-store");
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("X-Content-Type-Options", "nosniff");

  if (request.method !== "DELETE") {
    response.setHeader("Allow", "DELETE");
    return response.status(405).json({ error: "method_not_allowed" });
  }
  if (!request.headers.authorization?.startsWith("Bearer ")) {
    return response.status(401).json({ error: "token_missing" });
  }

  let clerkSecret: string;
  let databaseUrl: string;
  try {
    clerkSecret = requiredServerEnvironment("CLERK_SECRET_KEY");
    databaseUrl = requiredServerEnvironment("DATABASE_URL");
  } catch {
    return response.status(503).json({ error: "server_misconfigured" });
  }

  let userId: string;
  try {
    userId = await userIdFromRequest(request);
  } catch (error) {
    const code = error instanceof AuthenticationError ? error.code : "token_invalid";
    return response.status(401).json({ error: code });
  }

  try {
    const clerk = createClerkClient({ secretKey: clerkSecret });
    const sql = neon(databaseUrl);
    await sql.query(`
      CREATE TABLE IF NOT EXISTS lad_cloud_snapshots (
        user_id text PRIMARY KEY,
        data jsonb NOT NULL,
        revision bigint NOT NULL DEFAULT 1 CHECK (revision > 0),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await sql.query("DELETE FROM lad_cloud_snapshots WHERE user_id = $1", [userId]);
    const appleAuthorization = await revokeAppleAuthorization(userId, clerk);
    await clerk.users.deleteUser(userId);
    return response.status(200).json({ deleted: true, appleAuthorization });
  } catch {
    return response.status(500).json({ error: "account_deletion_failed" });
  }
}

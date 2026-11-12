import { neon } from "@neondatabase/serverless";
import type { VercelRequest, VercelResponse } from "@vercel/node";

import { validateLocalBackupData } from "../src/domain/backup";
import { isSafeRevision } from "../src/domain/sync";
import { AuthenticationError, requiredServerEnvironment } from "./_lib/requestAuth";
import { activeMemberFromRequest } from "./_lib/membership";

const MAX_BODY_BYTES = 1_000_000;
let schemaReady: Promise<void> | null = null;

function database() {
  return neon(requiredServerEnvironment("DATABASE_URL"));
}

async function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      const sql = database();
      await sql.query(`
        CREATE TABLE IF NOT EXISTS lad_cloud_snapshots (
          user_id text PRIMARY KEY,
          data jsonb NOT NULL,
          revision bigint NOT NULL DEFAULT 1 CHECK (revision > 0),
          updated_at timestamptz NOT NULL DEFAULT now()
        )
      `);
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  await schemaReady;
}

function responseSnapshot(row: Record<string, unknown> | undefined) {
  if (!row) return { data: null, revision: 0, updatedAt: null };
  return {
    data: validateLocalBackupData(row.data),
    revision: Number(row.revision),
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at),
  };
}

export const config = {
  api: { bodyParser: { sizeLimit: "1mb" } },
};

export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader("Cache-Control", "private, no-store");
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("X-Content-Type-Options", "nosniff");

  if (!request.method || !["GET", "PUT", "DELETE"].includes(request.method)) {
    response.setHeader("Allow", "GET, PUT, DELETE");
    return response.status(405).json({ error: "method_not_allowed" });
  }
  if (!request.headers.authorization?.startsWith("Bearer ")) {
    return response.status(401).json({ error: "token_missing" });
  }

  try {
    requiredServerEnvironment("CLERK_SECRET_KEY");
    requiredServerEnvironment("DATABASE_URL");
  } catch {
    return response.status(503).json({ error: "server_misconfigured" });
  }

  let userId: string;
  try {
    userId = (await activeMemberFromRequest(request)).id;
  } catch (error) {
    if (error instanceof AuthenticationError) return response.status(401).json({ error: error.code });
    return response.status(503).json({ error: "membership_unavailable" });
  }

  try {
    await ensureSchema();
    const sql = database();

    if (request.method === "GET") {
      const rows = await sql.query(
        "SELECT data, revision, updated_at FROM lad_cloud_snapshots WHERE user_id = $1",
        [userId],
      );
      return response.status(200).json(responseSnapshot(rows[0] as Record<string, unknown> | undefined));
    }

    if (request.method === "DELETE") {
      await sql.query("DELETE FROM lad_cloud_snapshots WHERE user_id = $1", [userId]);
      return response.status(204).end();
    }

    const encodedLength = Buffer.byteLength(JSON.stringify(request.body ?? null));
    if (encodedLength > MAX_BODY_BYTES) return response.status(413).json({ error: "payload_too_large" });
    const body = request.body as Record<string, unknown> | null;
    if (!body || !isSafeRevision(body.expectedRevision)) {
      return response.status(400).json({ error: "invalid_revision" });
    }
    let data;
    try {
      data = validateLocalBackupData(body.data);
    } catch {
      return response.status(400).json({ error: "invalid_data" });
    }
    // Updating a deleted backup must conflict rather than silently recreating
    // it with stale data. Creation and revision-checked updates are separate.
    const rows = body.expectedRevision === 0
      ? await sql.query(`INSERT INTO lad_cloud_snapshots (user_id, data, revision, updated_at)
          VALUES ($1, $2::jsonb, 1, now()) ON CONFLICT (user_id) DO NOTHING
          RETURNING data, revision, updated_at`, [userId, JSON.stringify(data)])
      : await sql.query(`UPDATE lad_cloud_snapshots SET data = $2::jsonb,
          revision = revision + 1, updated_at = now()
          WHERE user_id = $1 AND revision = $3 RETURNING data, revision, updated_at`,
        [userId, JSON.stringify(data), body.expectedRevision]);
    if (!rows[0]) return response.status(409).json({ error: "revision_conflict" });
    return response.status(200).json(responseSnapshot(rows[0] as Record<string, unknown>));
  } catch {
    return response.status(500).json({ error: "sync_failed" });
  }
}

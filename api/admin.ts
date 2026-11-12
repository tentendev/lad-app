import { neon } from "@neondatabase/serverless";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { activeMemberFromRequest, isMemberAdmin, memberClient, publicMember } from "./_lib/membership";
import { AuthenticationError, requiredServerEnvironment } from "./_lib/requestAuth";

const PAGE_SIZE = 20;

export const config = { api: { bodyParser: { sizeLimit: "4kb" } } };

export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader("Cache-Control", "private, no-store");
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("X-Content-Type-Options", "nosniff");
  if (!["GET", "POST"].includes(request.method ?? "")) {
    response.setHeader("Allow", "GET, POST");
    return response.status(405).json({ error: "method_not_allowed" });
  }
  if (!request.headers.authorization?.startsWith("Bearer ")) return response.status(401).json({ error: "token_missing" });
  let actor;
  try {
    actor = await activeMemberFromRequest(request);
  } catch (error) {
    if (error instanceof AuthenticationError) return response.status(401).json({ error: error.code });
    return response.status(503).json({ error: "membership_unavailable" });
  }
  if (!isMemberAdmin(actor)) return response.status(403).json({ error: "admin_required" });

  try {
    const clerk = memberClient();
    const sql = neon(requiredServerEnvironment("DATABASE_URL"));
    if (request.method === "GET") {
      const search = request.query.search ?? "";
      const offsetValue = request.query.offset ?? "0";
      if (typeof search !== "string" || search.length > 120 || typeof offsetValue !== "string" || !/^\d+$/.test(offsetValue)) {
        return response.status(400).json({ error: "invalid_query" });
      }
      const offset = Number(offsetValue);
      if (!Number.isSafeInteger(offset) || offset > 1_000_000) return response.status(400).json({ error: "invalid_query" });
      const page = await clerk.users.getUserList({ limit: PAGE_SIZE, offset, orderBy: "-created_at", ...(search.trim() ? { query: search.trim() } : {}) });
      const ids = page.data.map(user => user.id);
      const backups = ids.length ? await sql.query("SELECT user_id, revision, updated_at FROM lad_cloud_snapshots WHERE user_id = ANY($1::text[])", [ids]) : [];
      const audit = await sql.query("SELECT id, actor_id, target_id, action, reason, result, created_at FROM lad_member_audit ORDER BY created_at DESC, id DESC LIMIT 20");
      return response.status(200).json({
        viewerId: actor.id,
        totalCount: page.totalCount,
        offset,
        limit: PAGE_SIZE,
        members: page.data.map(user => {
          const backup = backups.find(row => row.user_id === user.id);
          return { ...publicMember(user), backup: backup ? { revision: Number(backup.revision), updatedAt: new Date(backup.updated_at as string | Date).toISOString() } : null };
        }),
        audit: audit.map(row => ({ id: String(row.id), actorId: row.actor_id, targetId: row.target_id, action: row.action, reason: row.reason, result: row.result, createdAt: new Date(row.created_at as string | Date).toISOString() })),
      });
    }

    const body = request.body as Record<string, unknown> | null;
    if (!body || Array.isArray(body) || !["ban", "unban"].includes(String(body.action)) || typeof body.userId !== "string" || !/^user_[A-Za-z0-9]+$/.test(body.userId) || typeof body.reason !== "string" || body.reason.trim().length < 2 || body.reason.length > 240) {
      return response.status(400).json({ error: "invalid_action" });
    }
    const target = await clerk.users.getUser(body.userId);
    if (target.id === actor.id || isMemberAdmin(target)) return response.status(403).json({ error: "protected_member" });
    // Persist the intent before touching the auth provider. An interrupted
    // operation remains visible as "requested" instead of losing the audit trail.
    const [record] = await sql.query("INSERT INTO lad_member_audit (actor_id, target_id, action, reason) VALUES ($1, $2, $3, $4) RETURNING id", [actor.id, target.id, body.action, body.reason.trim()]);
    if (!record) throw new Error("audit_not_saved");
    let updated;
    try {
      updated = body.action === "ban" ? await clerk.users.banUser(target.id) : await clerk.users.unbanUser(target.id);
    } catch (error) {
      await sql.query("UPDATE lad_member_audit SET result = 'failed' WHERE id = $1", [record.id]).catch(() => {});
      throw error;
    }
    let auditPending = false;
    await sql.query("UPDATE lad_member_audit SET result = 'succeeded' WHERE id = $1", [record.id]).catch(() => { auditPending = true; });
    return response.status(200).json({ member: publicMember(updated), auditPending });
  } catch (error) {
    const status = typeof error === "object" && error !== null && "status" in error ? Number(error.status) : 0;
    return response.status(status === 429 ? 429 : status === 404 ? 404 : 503).json({ error: status === 429 ? "rate_limited" : status === 404 ? "member_not_found" : "admin_unavailable" });
  }
}

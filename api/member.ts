import type { VercelRequest, VercelResponse } from "@vercel/node";
import { activeMemberFromRequest, isMemberAdmin } from "./_lib/membership";
import { AuthenticationError } from "./_lib/requestAuth";

export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader("Cache-Control", "private, no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "method_not_allowed" });
  }
  if (!request.headers.authorization?.startsWith("Bearer ")) return response.status(401).json({ error: "token_missing" });
  try {
    const user = await activeMemberFromRequest(request);
    return response.status(200).json({ userId: user.id, isAdmin: isMemberAdmin(user) });
  } catch (error) {
    if (error instanceof AuthenticationError) return response.status(401).json({ error: error.code });
    return response.status(503).json({ error: "membership_unavailable" });
  }
}

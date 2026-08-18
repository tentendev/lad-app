import { verifyToken } from "@clerk/backend";
import type { VercelRequest } from "@vercel/node";

export class AuthenticationError extends Error {
  constructor(readonly code: "token_missing" | "token_invalid") {
    super(code);
  }
}

export function requiredServerEnvironment(name: "CLERK_SECRET_KEY" | "DATABASE_URL"): string {
  const value = name === "CLERK_SECRET_KEY" ? process.env.CLERK_SECRET_KEY : process.env.DATABASE_URL;
  if (!value) throw new Error(`Missing server environment: ${name}`);
  return value;
}

function authorizedParties(): string[] {
  const values = new Set([
    "https://lad-pocket.vercel.app",
    "https://lad-pocket-auth-preview.vercel.app",
    "http://localhost:8081",
    "http://localhost:19006",
  ]);
  if (process.env.VERCEL_URL) values.add(`https://${process.env.VERCEL_URL}`);
  for (const value of (process.env.CLERK_AUTHORIZED_PARTIES ?? "").split(",")) {
    const origin = value.trim();
    if (origin) values.add(origin);
  }
  return [...values];
}

export async function userIdFromRequest(request: VercelRequest): Promise<string> {
  const authorization = request.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) throw new AuthenticationError("token_missing");
  const token = authorization.slice(7).trim();
  if (!token) throw new AuthenticationError("token_missing");
  try {
    const payload = await verifyToken(token, {
      secretKey: requiredServerEnvironment("CLERK_SECRET_KEY"),
    });
    if (payload.azp && !authorizedParties().includes(payload.azp)) {
      throw new AuthenticationError("token_invalid");
    }
    if (!payload.sub) throw new AuthenticationError("token_invalid");
    return payload.sub;
  } catch (error) {
    if (error instanceof AuthenticationError) throw error;
    throw new AuthenticationError("token_invalid");
  }
}

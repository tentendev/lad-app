import { createClerkClient } from "@clerk/backend";
import type { VercelRequest } from "@vercel/node";
import { AuthenticationError, requiredServerEnvironment, userIdFromRequest } from "./requestAuth";

export function memberClient() {
  return createClerkClient({ secretKey: requiredServerEnvironment("CLERK_SECRET_KEY") });
}

export type Member = Awaited<ReturnType<ReturnType<typeof memberClient>["users"]["getUser"]>>;

export function isMemberAdmin(user: Pick<Member, "id" | "privateMetadata">): boolean {
  const admins = (process.env.MEMBER_ADMIN_USER_IDS ?? "").split(",").map(value => value.trim()).filter(Boolean);
  return admins.includes(user.id) || user.privateMetadata?.ladRole === "admin";
}

export async function activeMemberFromRequest(request: VercelRequest): Promise<Member> {
  const id = await userIdFromRequest(request);
  const user = await memberClient().users.getUser(id).catch(error => {
    if (typeof error === "object" && error !== null && "status" in error && error.status === 404) throw new AuthenticationError("token_invalid");
    throw error;
  });
  if (user.banned) throw new AuthenticationError("token_invalid");
  return user;
}

export function publicMember(user: Member) {
  const email = user.emailAddresses.find(address => address.id === user.primaryEmailAddressId);
  return {
    id: user.id,
    name: [user.firstName, user.lastName].filter(Boolean).join(" ") || "未設定名稱",
    email: email?.emailAddress ?? null,
    emailVerified: email?.verification?.status === "verified",
    createdAt: user.createdAt,
    lastSignInAt: user.lastSignInAt,
    banned: user.banned,
    isAdmin: isMemberAdmin(user),
  };
}

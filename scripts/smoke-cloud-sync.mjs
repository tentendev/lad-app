import { spawnSync } from "node:child_process";
import { createClerkClient, verifyToken } from "@clerk/backend";

const deployment = process.argv[2];
if (!deployment) throw new Error("Pass a Vercel preview deployment URL.");
if (!process.env.CLERK_SECRET_KEY) throw new Error("CLERK_SECRET_KEY is required.");

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
let userId;

function callApi(path, method, token, body) {
  const args = [
    "curl",
    path,
    "--deployment",
    deployment,
    "--",
    "--silent",
    "--show-error",
    "--request",
    method,
    "--header",
    `Authorization: Bearer ${token}`,
    "--write-out",
    "\n__STATUS__%{http_code}",
  ];
  if (body !== undefined) args.push("--header", "Content-Type: application/json", "--data", JSON.stringify(body));
  const result = spawnSync("vercel", args, { encoding: "utf8" });
  if (result.status !== 0) throw new Error(`Vercel request failed: ${result.stderr.trim()}`);
  const match = result.stdout.match(/\n__STATUS__(\d{3})\s*$/);
  if (!match) throw new Error("Vercel request did not return a status marker.");
  const status = Number(match[1]);
  const source = result.stdout.slice(0, match.index).trim();
  const value = source ? JSON.parse(source) : null;
  return { status, value };
}

function callSync(method, token, body) {
  return callApi("/api/sync", method, token, body);
}

try {
  const testId = Date.now();
  const user = await clerk.users.createUser({
    externalId: `lad-sync-smoke-${testId}`,
    emailAddress: [`lad-sync-smoke-${testId}@example.com`],
    firstName: "Sync",
    lastName: "Smoke",
    skipPasswordRequirement: true,
    skipLegalChecks: true,
  });
  userId = user.id;
  const session = await clerk.sessions.createSession({ userId });
  const token = (await clerk.sessions.getToken(session.id)).jwt;
  const claims = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY });
  console.log(`Smoke token authorized party: ${claims.azp ?? "none"}.`);
  const data = {
    budgets: { "2026-08": { amount: 3000, threshold: 80 } },
    expenses: [],
    calculator: null,
  };

  const empty = callSync("GET", token);
  if (empty.status !== 200 || empty.value?.revision !== 0 || empty.value?.data !== null) {
    throw new Error(`Initial snapshot was not empty: ${JSON.stringify(empty)}`);
  }

  const created = callSync("PUT", token, { data, expectedRevision: 0 });
  if (created.status !== 200 || created.value?.revision !== 1) throw new Error("Snapshot creation failed.");

  const conflict = callSync("PUT", token, { data, expectedRevision: 0 });
  if (conflict.status !== 409) throw new Error("Stale revision was not rejected.");

  const fetched = callSync("GET", token);
  if (fetched.status !== 200 || fetched.value?.data?.budgets?.["2026-08"]?.amount !== 3000) throw new Error("Snapshot round-trip failed.");

  const removed = callSync("DELETE", token);
  if (removed.status !== 204) throw new Error("Snapshot deletion failed.");

  const afterDelete = callSync("GET", token);
  if (afterDelete.status !== 200 || afterDelete.value?.data !== null) throw new Error("Deleted snapshot remained visible.");

  const recreated = callSync("PUT", token, { data, expectedRevision: 0 });
  if (recreated.status !== 200 || recreated.value?.revision !== 1) throw new Error("Snapshot recreation before account deletion failed.");

  const accountDeleted = callApi("/api/account", "DELETE", token);
  if (accountDeleted.status !== 200 || accountDeleted.value?.deleted !== true || accountDeleted.value?.appleAuthorization !== "not_connected") {
    throw new Error("Server-side account deletion failed.");
  }
  userId = undefined;

  console.log("Cloud/account smoke test passed: auth, create, conflict, read, snapshot delete, and permanent account delete.");
} finally {
  if (userId) await clerk.users.deleteUser(userId).catch(() => undefined);
}
